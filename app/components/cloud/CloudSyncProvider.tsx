"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createClient } from "../../../lib/supabase/client";

type CloudState = "iniciando" | "sincronizando" | "sincronizado" | "error" | "sin-taller";

type CloudSyncContextValue = {
  estado: CloudState;
  sincronizar: () => Promise<void>;
  ultimaSincronizacion: string | null;
};

const IGNORE_KEYS = ["sb-", "ryuka-cloud-", "ryuka-productos", "ryuka-products-relational-"];
const CLOUD_INITIALIZED_KEY = "ryuka-cloud-inicializado";
const CloudSyncContext = createContext<CloudSyncContextValue>({
  estado: "iniciando",
  sincronizar: async () => {},
  ultimaSincronizacion: null,
});

function obtenerEstadoLocal() {
  const estado: Record<string, string> = {};

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (key && !IGNORE_KEYS.some((prefix) => key.startsWith(prefix))) {
      estado[key] = localStorage.getItem(key) ?? "";
    }
  }

  return estado;
}

function aplicarEstadoCloud(state: Record<string, string>) {
  const clavesLocales = Object.keys(obtenerEstadoLocal());
  const clavesCloud = Object.keys(state);

  // También elimina datos que ya fueron borrados desde otro dispositivo.
  clavesLocales
    .filter((key) => !clavesCloud.includes(key))
    .forEach((key) => localStorage.removeItem(key));

  Object.entries(state).forEach(([key, value]) => {
    localStorage.setItem(key, value);
  });

  localStorage.setItem(CLOUD_INITIALIZED_KEY, "1");
}

export default function CloudSyncProvider({ children }: { children: React.ReactNode }) {
  const [estado, setEstado] = useState<CloudState>("iniciando");
  const [ultimaSincronizacion, setUltimaSincronizacion] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const workspaceId = useRef<string | null>(null);
  const userId = useRef<string | null>(null);
  const applyingCloud = useRef(false);
  const lastCloudUpdate = useRef<string | null>(null);

  const subir = useCallback(async () => {
    if (!workspaceId.current || !userId.current || applyingCloud.current) return;

    setEstado("sincronizando");
    const supabase = createClient();
    const now = new Date().toISOString();

    const { error } = await supabase
      .from("app_state")
      .upsert(
        {
          workspace_id: workspaceId.current,
          state: obtenerEstadoLocal(),
          updated_at: now,
          updated_by: userId.current,
        },
        { onConflict: "workspace_id" }
      );

    if (error) {
      console.error("Error al sincronizar Ryuka:", error);
      setEstado("error");
      return;
    }

    lastCloudUpdate.current = now;
    setUltimaSincronizacion(now);
    setEstado("sincronizado");
  }, []);

  useEffect(() => {
    let activo = true;
    const supabase = createClient();

    async function aplicarDesdeCloud(state: Record<string, string>, updatedAt?: string | null) {
      if (!activo) return;
      applyingCloud.current = true;
      aplicarEstadoCloud(state);
      applyingCloud.current = false;
      lastCloudUpdate.current = updatedAt ?? null;
      setUltimaSincronizacion(updatedAt ?? new Date().toISOString());
      setEstado("sincronizado");
      window.dispatchEvent(new CustomEvent("ryuka-cloud-loaded"));
    }

    async function iniciar() {
      setEstado("iniciando");
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError || !userData.user) return;
      userId.current = userData.user.id;

      const { data: membership, error: membershipError } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", userData.user.id)
        .limit(1)
        .maybeSingle();

      if (membershipError || !membership) {
        if (activo) setEstado("sin-taller");
        return;
      }

      workspaceId.current = membership.workspace_id;

      const { data: cloud, error: cloudError } = await supabase
        .from("app_state")
        .select("state, updated_at")
        .eq("workspace_id", membership.workspace_id)
        .maybeSingle();

      if (cloudError) {
        console.error("Error al leer la nube de Ryuka:", cloudError);
        if (activo) setEstado("error");
        return;
      }

      const localMigrated = localStorage.getItem(CLOUD_INITIALIZED_KEY) === "1";
      const cloudState = (cloud?.state ?? {}) as Record<string, string>;

      if (Object.keys(cloudState).length > 0) {
        await aplicarDesdeCloud(cloudState, cloud?.updated_at ?? null);
      } else if (!localMigrated || Object.keys(obtenerEstadoLocal()).length > 0) {
        await subir();
        localStorage.setItem(CLOUD_INITIALIZED_KEY, "1");
      } else if (activo) {
        setEstado("sincronizado");
      }
    }

    void iniciar();

    const originalSet = Storage.prototype.setItem;
    const originalRemove = Storage.prototype.removeItem;

    const schedule = () => {
      if (applyingCloud.current) return;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void subir(), 700);
    };

    Storage.prototype.setItem = function setItem(key, value) {
      originalSet.call(this, key, value);
      if (this === localStorage && !IGNORE_KEYS.some((prefix) => key.startsWith(prefix))) {
        schedule();
      }
    };

    Storage.prototype.removeItem = function removeItem(key) {
      originalRemove.call(this, key);
      if (this === localStorage && !IGNORE_KEYS.some((prefix) => key.startsWith(prefix))) {
        schedule();
      }
    };

    const channel = supabase
      .channel("ryuka-app-state")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "app_state" },
        async (payload) => {
          const row = payload.new as {
            workspace_id?: string;
            state?: Record<string, string>;
            updated_at?: string;
            updated_by?: string;
          };

          if (!row.workspace_id || row.workspace_id !== workspaceId.current) return;
          if (row.updated_by && row.updated_by === userId.current) return;
          if (row.updated_at && row.updated_at === lastCloudUpdate.current) return;

          await aplicarDesdeCloud(row.state ?? {}, row.updated_at ?? null);
        }
      )
      .subscribe();

    const onVisible = () => {
      if (document.visibilityState === "visible") void iniciar();
    };

    document.addEventListener("visibilitychange", onVisible);

    return () => {
      activo = false;
      Storage.prototype.setItem = originalSet;
      Storage.prototype.removeItem = originalRemove;
      document.removeEventListener("visibilitychange", onVisible);
      void supabase.removeChannel(channel);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [subir]);

  return (
    <CloudSyncContext.Provider value={{ estado, sincronizar: subir, ultimaSincronizacion }}>
      {children}
    </CloudSyncContext.Provider>
  );
}

export function useCloudSync() {
  return useContext(CloudSyncContext);
}
