$authUrl = "https://api-learn.ispringlearn.eu/api/v3/token"
$clientId = "fc904fde-011a-11f1-9d01-0ef1391a362b"
$clientSecret = "0mLYIDJ2iVP8ZHNZlY4cck_g6-mpf-AxWfgdouRVNyw"

$authBody = "client_id=$clientId&client_secret=$clientSecret&grant_type=client_credentials"

try {
    Write-Host "1. Getting API token..."
    $authResponse = Invoke-RestMethod -Uri $authUrl -Method Post -Body $authBody -ContentType "application/x-www-form-urlencoded"
    $token = $authResponse.access_token

    if ($token) {
        Write-Host "Token retrieved successfully!"
        
        $resultsUrl = "https://api-learn.ispringlearn.eu/api/v1/learners/modules/results"
        $headers = @{
            "Authorization" = "Bearer $token"
        }

        Write-Host "2. Fetching learner results..."
        
        try {
            $resultsResponse = Invoke-RestMethod -Uri $resultsUrl -Method Get -Headers $headers
            Write-Host "Result fetch complete. Sample data:"
            # Just print the first 5 elements or the raw response to avoid massive console spam
            $resultsResponse | Select-Object -First 5 | ConvertTo-Json -Depth 3
        } catch {
            Write-Host "Error fetching results: $_"
            if ($_.Exception.Response) {
                $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                Write-Host "Response Body: $($reader.ReadToEnd())"
            }
        }
    }
} catch {
    Write-Host "Error occurred during auth: $_"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host "Response Body: $($reader.ReadToEnd())"
    }
}
