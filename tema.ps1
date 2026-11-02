$reemplazos = @(
  @('[#101010]', '[var(--bg)]'),
  @('[#1b1b1b]', '[var(--card)]'),
  @('[#181818]', '[var(--card)]'),
  @('[#151515]', '[var(--field)]'),
  @('[#121212]', '[var(--field)]'),
  @('[#0d0d0d]', '[var(--field)]'),
  @('[#171717]', '[var(--field)]'),
  @('[#201313]', '[var(--card-accent)]'),
  @('[#2b2b2b]', '[var(--border)]'),
  @('[#303030]', '[var(--border)]'),
  @('[#3a3a3a]', '[var(--border)]'),
  @('[#404040]', '[var(--border)]'),
  @('[#810404]', '[var(--accent)]'),
  @('[#a00808]', '[var(--accent-hover)]'),
  @('border-white/10', 'border-[var(--border)]'),
  @('bg-red-700', 'bg-[var(--accent)]'),
  @('hover:bg-red-600', 'hover:bg-[var(--accent-hover)]'),
  @('border-red-700', 'border-[var(--accent)]'),
  @('text-red-300', 'text-[var(--accent-text)]'),
  @('text-white', 'text-[var(--text)]'),
  @('text-zinc-200', 'text-[var(--text)]'),
  @('text-zinc-300', 'text-[var(--muted)]'),
  @('text-zinc-400', 'text-[var(--muted)]'),
  @('text-zinc-500', 'text-[var(--muted)]'),
  @('text-gray-200', 'text-[var(--text)]'),
  @('text-gray-300', 'text-[var(--muted)]'),
  @('text-gray-400', 'text-[var(--muted)]'),
  @('text-gray-500', 'text-[var(--muted)]'),
  @('bg-black/20', 'bg-[var(--overlay)]'),
  @('bg-white/[0.03]', 'bg-[var(--overlay)]'),
  @('bg-white/[0.04]', 'bg-[var(--overlay)]'),
  @('bg-white/5', 'bg-[var(--overlay)]')
)

$archivos = Get-ChildItem -Path app, src -Recurse -Include *.ts, *.tsx

foreach ($archivo in $archivos) {
  $contenido = [System.IO.File]::ReadAllText($archivo.FullName)
  $original = $contenido

  foreach ($par in $reemplazos) {
    $contenido = $contenido.Replace($par[0], $par[1])
  }

  if ($contenido -ne $original) {
    [System.IO.File]::WriteAllText($archivo.FullName, $contenido)
    Write-Host ("Actualizado: " + $archivo.FullName)
  }
}

Write-Host "Listo: reemplazos de tema aplicados."