$tokenUrl = "https://api-learn.ispringlearn.eu/api/v3/token"
$clientId = "fc904fde-011a-11f1-9d01-0ef1391a362b"
$clientSecret = "0mLYIDJ2iVP8ZHNZlY4cck_g6-mpf-AxWfgdouRVNyw"

$authBody = "client_id=$clientId&client_secret=$clientSecret&grant_type=client_credentials"

try {
    Write-Host "1. Getting API token..."
    $authResponse = Invoke-RestMethod -Uri $tokenUrl -Method Post -Body $authBody -ContentType "application/x-www-form-urlencoded"
    $token = $authResponse.access_token

    if ($token) {
        Write-Host "Token retrieved successfully!"
        
        # We need a course ID to test. Let's use one of the ones seeded or a known iSpring ID.
        # Often IDs are UUIDs or integers. The docs said "123". The seed data used "ISP-CRS-001".
        # Let's try to query courses list first to get a valid ID if possible.
        # But if the REST API isn't fully enabled, we might not get that either.
        # Let's try the XML endpoint with an arbitrary ID first to see if we get a 200 or 404/403.
        
        $testCourseId = "ISP-CRS-001" # Or some other known ID you have in your iSpring account
        
        $resultsUrl = "https://api-learn.ispringlearn.eu/content/$testCourseId/final_statuses"
        # Notice: The docs say `/content/{id}`, not `/api/v1/content/{id}`! 
        # But often it's behind `/api/`. I'll try without api/ first as per the docs, then with.
        
        $urlsToTest = @(
            "https://api-learn.ispringlearn.eu/content/$testCourseId/final_statuses",
            "https://api-learn.ispringlearn.eu/api/content/$testCourseId/final_statuses",
            "https://api-learn.ispringlearn.eu/api/v1/content/$testCourseId/final_statuses",
            "https://api-learn.ispringlearn.eu/api/v3/content/$testCourseId/final_statuses"
        )
        
        $headers = @{ "Authorization" = "Bearer $token" }
        
        foreach ($url in $urlsToTest) {
            Write-Host "`nTesting: $url"
            try {
                $res = Invoke-RestMethod -Uri $url -Method Get -Headers $headers
                Write-Host ">>> SUCCESS!"
                Write-Host ($res | Out-String)
            } catch {
                Write-Host "Failed: $($_.Exception.Response.StatusCode.value__)"
            }
        }
    }
} catch {
    Write-Host "Auth Error: $_"
}
