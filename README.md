# Investment Portfolio API Documentation

A portfolio tracking service lets you buy/sell securities, also update/remove the latest trade.


# REST APIS


## Add a trade  
You can perform a trade(buy/sell) of security using this API.

**Request:**
```json
POST /api/v1/trade  HTTP/1.1
Content-Type: application/json

{
    "type": "buy / sell",
    "ticker": "REL",
    "quantity": 2,
    "price":50
}
```
**Successful Response:**
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
    "success": true,
    "error": false,
    "message": {
        "_id" : "60b278d106f9763fe409ccc4",
        "portfolioId" : "60b278d106f9763fe409ccc3",
        "type" : "buy",
        "ticker" : "REL",
        "quantity" : 2,
        "price" : 50,
        "createdAt" : "2021-05-29T22:54:33.702+05:30",
        "updatedAt" : "2021-05-29T22:54:33.702+05:30"
    }
}
```
## Update a trade  
You can only update the latest trade of a security.
Only the parameter which needs to be updated should be included in the request, request body is same as `Add a trade` API.

**Request:**
```json
PUT /api/v1/trade/:id  HTTP/1.1
Content-Type: application/json

{
    "type": "buy / sell",
    "ticker": "REL",
    "quantity": 2,
    "price":50
}
```
**Successful Response:**
```json
HTTP/1.1 204 No content
```

## Remove a trade  
You can only remove latest trade of a security, which bring back the security to it's previous state.

**Request:**
```json
DELETE /api/v1/trade/:id  HTTP/1.1
```
**Successful Response:**
```json
HTTP/1.1 204 No Content
```


## Fetch Trades
Fetch all the securities and trades correspond to it.

**Request:**
```json
GET /api/v1/trades  HTTP/1.1
Content-Type: application/json
```
**Successful Response:**
```json
HTTP/1.1 200 OK
Content-Type: application/json
{
    "success": true,
    "error": false,
    "data":[
        {
            "_id": "REL",
            "trades": [
                {
                    "_id": "60b278d706f9763fe409ccc5",
                    "type": "buy",
                    "quantity": 2,
                    "price": 50,
                    "createdAt": "2021-05-29T17:24:39.494Z"
                }
            ]
        }
    ]
}
```

## Fetch Portfolio
It is an aggregate view of all securities in the portfolio with its final
quantity and average buy price

**Request:**
```json
GET /api/v1/portfolio  HTTP/1.1
Content-Type: application/json
```
**Successful Response:**
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
    "success": true,
    "error": false,
    "data": {
        "_id": "60b27763a81d573e17ebab18",
        "totalInvestment": 300,
        "securities": [
            {
                "ticker": "REL",
                "quantity": 4,
                "avgPrice": 75,
                "totalPrice": 300
            }
        ]
    }
}
```

## Fetch Returns
Returns is the profit earned through investment, below is the formula to calculate returns  
`(Current Price - Avg Price) * Quantity`  

This API returns sum of returns from all the securities

**Request:**
```json
GET /api/v1/returns  HTTP/1.1
Content-Type: application/json
```
**Successful Response:**
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
    "success": true,
    "error": false,
    "data": 100
}
```