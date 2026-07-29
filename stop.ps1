Write-Host "Deteniendo FutbolYa..." -ForegroundColor Cyan
docker compose down
if ($?) {
  Write-Host "Contenedores detenidos." -ForegroundColor Green
}
