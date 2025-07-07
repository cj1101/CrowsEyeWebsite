# Crow's Eye API Testing Suite
# Consolidated testing script for all API endpoints and functionality

param(
    [Parameter(Position=0)]
    [ValidateSet("quick", "auth", "media", "full", "endpoints")]
    [string]$TestType = "quick",
    
    [Parameter()]
    [string]$Email = "charlie@suarezhouse.net",
    
    [Parameter()]
    [string]$Password = "ProAccess123!",
    
    [Parameter()]
    [string]$ApiUrl = "http://localhost:8001"
)

Write-Host "🦅 Crow's Eye API Testing Suite" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Test Type: $TestType" -ForegroundColor Yellow
Write-Host "API URL: $ApiUrl" -ForegroundColor Yellow
Write-Host ""

function Test-QuickConnection {
    Write-Host "🔍 Running Quick Connection Test..." -ForegroundColor Green
    
    try {
        $response = Invoke-RestMethod -Uri "$ApiUrl/docs" -Method Get -ErrorAction Stop
        Write-Host "✅ API Documentation accessible" -ForegroundColor Green
        
        $response = Invoke-RestMethod -Uri "$ApiUrl/api/v1/health" -Method Get -ErrorAction Stop
        Write-Host "✅ Health check passed: $($response.status)" -ForegroundColor Green
        
        return $true
    }
    catch {
        Write-Host "❌ Quick connection test failed: $_" -ForegroundColor Red
        return $false
    }
}

function Test-Authentication {
    Write-Host "🔐 Running Authentication Test..." -ForegroundColor Green
    
    try {
        # Login
        $loginBody = @{
            email = $Email
            password = $Password
        } | ConvertTo-Json
        
        $loginResponse = Invoke-RestMethod -Uri "$ApiUrl/api/v1/auth/login" -Method Post -Body $loginBody -ContentType "application/json" -ErrorAction Stop
        Write-Host "✅ Login successful" -ForegroundColor Green
        
        $token = $loginResponse.access_token
        
        # Verify token
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        
        $userResponse = Invoke-RestMethod -Uri "$ApiUrl/api/v1/auth/me" -Method Get -Headers $headers -ErrorAction Stop
        Write-Host "✅ Token verification successful" -ForegroundColor Green
        Write-Host "   User: $($userResponse.email)" -ForegroundColor Gray
        Write-Host "   Tier: $($userResponse.subscription_tier)" -ForegroundColor Gray
        
        return $token
    }
    catch {
        Write-Host "❌ Authentication test failed: $_" -ForegroundColor Red
        return $null
    }
}

function Test-MediaEndpoints {
    param([string]$Token)
    
    Write-Host "📸 Running Media Endpoints Test..." -ForegroundColor Green
    
    $headers = @{
        "Authorization" = "Bearer $Token"
    }
    
    try {
        # Test library endpoint
        $response = Invoke-RestMethod -Uri "$ApiUrl/api/v1/media/library" -Method Get -Headers $headers -ErrorAction Stop
        Write-Host "✅ Media library accessible" -ForegroundColor Green
        Write-Host "   Items: $($response.items.Count)" -ForegroundColor Gray
        
        # Test gallery endpoint
        $response = Invoke-RestMethod -Uri "$ApiUrl/api/v1/media/galleries" -Method Get -Headers $headers -ErrorAction Stop
        Write-Host "✅ Galleries accessible" -ForegroundColor Green
        Write-Host "   Galleries: $($response.galleries.Count)" -ForegroundColor Gray
        
        return $true
    }
    catch {
        Write-Host "❌ Media endpoints test failed: $_" -ForegroundColor Red
        return $false
    }
}

function Test-AllEndpoints {
    param([string]$Token)
    
    Write-Host "🔍 Running Comprehensive Endpoint Test..." -ForegroundColor Green
    
    $headers = @{
        "Authorization" = "Bearer $Token"
    }
    
    $endpoints = @(
        @{Path="/api/v1/users/profile"; Method="GET"; Name="User Profile"},
        @{Path="/api/v1/platforms"; Method="GET"; Name="Platform Connections"},
        @{Path="/api/v1/posts"; Method="GET"; Name="Posts"},
        @{Path="/api/v1/analytics/overview"; Method="GET"; Name="Analytics"},
        @{Path="/api/v1/templates"; Method="GET"; Name="Templates"},
        @{Path="/api/v1/ai/models"; Method="GET"; Name="AI Models"}
    )
    
    $passed = 0
    $failed = 0
    
    foreach ($endpoint in $endpoints) {
        try {
            $response = Invoke-RestMethod -Uri "$ApiUrl$($endpoint.Path)" -Method $endpoint.Method -Headers $headers -ErrorAction Stop
            Write-Host "✅ $($endpoint.Name): OK" -ForegroundColor Green
            $passed++
        }
        catch {
            Write-Host "❌ $($endpoint.Name): FAILED - $($_.Exception.Message)" -ForegroundColor Red
            $failed++
        }
    }
    
    Write-Host ""
    Write-Host "Summary: $passed passed, $failed failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Yellow" })
}

# Main execution
switch ($TestType) {
    "quick" {
        Test-QuickConnection
    }
    
    "auth" {
        Test-Authentication
    }
    
    "media" {
        $token = Test-Authentication
        if ($token) {
            Test-MediaEndpoints -Token $token
        }
    }
    
    "endpoints" {
        $token = Test-Authentication
        if ($token) {
            Test-AllEndpoints -Token $token
        }
    }
    
    "full" {
        Write-Host "Running Full Test Suite..." -ForegroundColor Magenta
        Write-Host ""
        
        if (Test-QuickConnection) {
            $token = Test-Authentication
            if ($token) {
                Test-MediaEndpoints -Token $token
                Test-AllEndpoints -Token $token
            }
        }
    }
}

Write-Host ""
Write-Host "Test completed!" -ForegroundColor Cyan 