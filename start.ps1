Write-Host "Iniciando FutbolYa con Docker..." -ForegroundColor Cyan
docker compose up --build -d
if ($?) {
  Write-Host ""
  Write-Host "API:        http://localhost:3002" -ForegroundColor Green
  Write-Host "Web:        http://localhost:5173" -ForegroundColor Green
  Write-Host ""
  Write-Host "Para ver logs en tiempo real: docker compose logs -f" -ForegroundColor Yellow
  Write-Host "Para detener:                  .\stop.ps1" -ForegroundColor Yellow
}
