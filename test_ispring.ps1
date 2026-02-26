$url = "https://api-learn.ispringlearn.eu/api/v3/token"
$clientId = "fc904fde-011a-11f1-9d01-0ef1391a362b"
$clientSecret = "0mLYIDJ2iVP8ZHNZlY4cck_g6-mpf-AxWfgdouRVNyw"

$body = "client_id=$clientId&client_secret=$clientSecret&grant_type=client_credentials"

try {
    Write-Host "Testing iSpring API with x-www-form-urlencoded..."
    $response = Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "application/x-www-form-urlencoded"
    Write-Host "iSpring response:"
    $response | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Error occurred: $_"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host "Response Body: $($reader.ReadToEnd())"
    }
}
