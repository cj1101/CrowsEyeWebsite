import requests
import json

def test_login():
    url = "http://localhost:8001/api/v1/auth/login"
    data = {
        "email": "charlie@suarezhouse.net",
        "password": "ProAccess123!"
    }
    
    try:
        response = requests.post(url, json=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            if result.get("success"):
                print("✅ Login successful!")
                print(f"User data: {result.get('data', {}).get('user', {})}")
            else:
                print(f"❌ Login failed: {result.get('error')}")
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend API. Is it running?")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_login() 