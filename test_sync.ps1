$loginUrl = "http://localhost:8080/api/auth/login"
$syncUrl = "http://localhost:8080/api/lms/sync"

$loginData = @{
    email = "admin@iberia.tn"
    password = "Admin123!"
} | ConvertTo-Json

try {
    Write-Host "Authenticating..."
    $response = Invoke-RestMethod -Uri $loginUrl -Method Post -Body $loginData -ContentType "application/json"
    Write-Host ($response | ConvertTo-Json -Depth 5)
    $token = $response.jwt
    if (-not $token) { $token = $response.token }
    if (-not $token) { $token = $response.accessToken }
    
    if ($token) {
        Write-Host "Authentication successful. Token retrieved."
        Write-Host "Triggering LMS Sync..."

        $headers = @{
            Authorization = "Bearer $token"
        }

        $syncResponse = Invoke-RestMethod -Uri $syncUrl -Method Post -Headers $headers
        Write-Host "Sync Response:"
        $syncResponse | ConvertTo-Json -Depth 5
    } else {
        Write-Host "Authentication failed. No token in response."
    }
} catch {
    Write-Host "Error occurred: $_"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host "Response Body: $($reader.ReadToEnd())"
    }
}
