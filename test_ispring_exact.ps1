$tokenUrl = "https://api-learn.ispringlearn.eu/api/v3/token"
$clientId = "fc904fde-011a-11f1-9d01-0ef1391a362b"
$clientSecret = "0mLYIDJ2iVP8ZHNZlY4cck_g6-mpf-AxWfgdouRVNyw"

$authBody = "client_id=$clientId&client_secret=$clientSecret&grant_type=client_credentials"

try {
    $authResponse = Invoke-RestMethod -Uri $tokenUrl -Method Post -Body $authBody -ContentType "application/x-www-form-urlencoded"
    $token = $authResponse.access_token

    if ($token) {
        $headers = @{ "Authorization" = "Bearer $token" }
        $url = "https://api-learn.ispringlearn.eu/api/v1/learners/modules/results"
        
        Write-Host "Testing: $url"
        try {
            # Sometimes iSpring requires Accept: application/json
            $headers["Accept"] = "application/json"
            $res = Invoke-RestMethod -Uri $url -Method Get -Headers $headers
            Write-Host ">>> SUCCESS!"
            $res | ConvertTo-Json -Depth 5
        } catch {
            Write-Host "Failed: $($_.Exception.Response.StatusCode.value__)"
            if ($_.Exception.Response) {
                $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                Write-Host "Response Body: $($reader.ReadToEnd())"
            }
        }
    }
} catch {
    Write-Host "Auth Error: $_"
}
