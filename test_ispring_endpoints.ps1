$tokenUrl = "https://api-learn.ispringlearn.eu/api/v3/token"
$clientId = "fc904fde-011a-11f1-9d01-0ef1391a362b"
$clientSecret = "0mLYIDJ2iVP8ZHNZlY4cck_g6-mpf-AxWfgdouRVNyw"

$authBody = "client_id=$clientId&client_secret=$clientSecret&grant_type=client_credentials"

try {
    $authResponse = Invoke-RestMethod -Uri $tokenUrl -Method Post -Body $authBody -ContentType "application/x-www-form-urlencoded"
    $token = $authResponse.access_token

    if ($token) {
        $headers = @{ "Authorization" = "Bearer $token" }
        
        $endpointsToTest = @(
            "https://api-learn.ispringlearn.eu/api/v1/report/learner_activity",
            "https://api-learn.ispringlearn.eu/api/v1/learning_path/results",
            "https://api-learn.ispringlearn.eu/api/v1/user/results",
            "https://api-learn.ispringlearn.eu/api/v1/courses/results",
            "https://api-learn.ispringlearn.eu/api/v1/reports/user_progress",
            "https://api-learn.ispringlearn.eu/api/v1/results",
            "https://api-learn.ispringlearn.eu/api/v3/reports/learner"
        )
        
        foreach ($url in $endpointsToTest) {
            Write-Host "`nTesting: $url"
            try {
                $res = Invoke-RestMethod -Uri $url -Method Get -Headers $headers
                Write-Host ">>> SUCCESS!"
                $res | Select-Object -First 1 | ConvertTo-Json -Depth 2
            } catch {
                Write-Host "Failed: $($_.Exception.Response.StatusCode.value__)"
            }
        }
    }
} catch {
    Write-Host "Auth Error: $_"
}
