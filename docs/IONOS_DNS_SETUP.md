# IONOS DNS Setup for Firebase Hosting

## Overview
This guide will help you configure your IONOS domain `crowseye.tech` to work with Firebase Hosting.

## Step 1: Get Firebase Hosting IP Addresses

Firebase uses these IP addresses for custom domains:
- `151.101.1.195`
- `151.101.65.195`

## Step 2: Configure DNS in IONOS

### Login to IONOS
1. Go to [IONOS Control Panel](https://www.ionos.com/help/domains/configuring-your-domain/changing-dns-settings/)
2. Navigate to **Domains & SSL** → **Domains**
3. Click on `crowseye.tech`
4. Go to **DNS** settings

### DNS Records to Add/Update

#### For Root Domain (crowseye.tech):

Type: A
Name: @ (or leave blank)
Value: 151.101.1.195
TTL: 3600

Type: A  
Name: @ (or leave blank)
Value: 151.101.65.195
TTL: 3600