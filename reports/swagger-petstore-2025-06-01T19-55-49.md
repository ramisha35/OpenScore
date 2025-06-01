# 🔍 OpenAPI Score Report: Swagger Petstore

**Generated:** 6/1/2025, 11:55:49 PM  
**Scorer:** Theneo OpenAPI Scorer v1.0.0

---

## 📊 Overall Score

<div align="center">

### 💥 12/100 | Grade: F
**Poor**

</div>

## 📋 Executive Summary

| Metric | Count | Status |
|--------|-------|---------|
| **Total Issues** | 103 | 🔴 Needs Attention |
| **Critical Issues** | 0 | ✅ None |
| **High Issues** | 32 | 🟠 |
| **Medium Issues** | 33 | 🟡 |
| **Low Issues** | 38 | 🟢 |

## 📈 Detailed Analysis

### Scoring Breakdown

| Criterion | Score | Percentage | Weight | Weighted Score | Issues |
|-----------|-------|------------|--------|----------------|--------|
| 🔴 **Schema & Types** | 0/20 | 0% | 20% | 0.0 | 18 |
| 🔴 **Descriptions & Documentation** | 0/20 | 0% | 20% | 0.0 | 12 |
| 🔴 **Paths & Operations** | 1/15 | 7% | 15% | 1.0 | 13 |
| 🔴 **Response Codes** | 0/15 | 0% | 15% | 0.0 | 40 |
| 🔴 **Examples & Samples** | 3/10 | 30% | 10% | 3.0 | 7 |
| 🔴 **Security** | 0/10 | 0% | 10% | 0.0 | 12 |
| 🟡 **Miscellaneous Best Practices** | 8/10 | 80% | 10% | 8.0 | 1 |

### 🔴 Schema & Types

**Score:** 0/20 (0%) | **Status:** 🔴 Needs Improvement  
**Weight:** 20% | **Weighted Score:** 0.0

#### 🔍 Issues Found (18)

##### 🟠 High Issues (18)

**1.** Parameter "petId" has neither schema nor content defined

- **📍 Location:** `/pet/{petId}/uploadImage` → `post` → `parameters[0]`
- **💡 Suggestion:** Define either a schema or content for the parameter

**2.** Parameter "additionalMetadata" has neither schema nor content defined

- **📍 Location:** `/pet/{petId}/uploadImage` → `post` → `parameters[1]`
- **💡 Suggestion:** Define either a schema or content for the parameter

**3.** Parameter "file" has neither schema nor content defined

- **📍 Location:** `/pet/{petId}/uploadImage` → `post` → `parameters[2]`
- **💡 Suggestion:** Define either a schema or content for the parameter

**4.** Parameter "status" has neither schema nor content defined

- **📍 Location:** `/pet/findByStatus` → `get` → `parameters[0]`
- **💡 Suggestion:** Define either a schema or content for the parameter

**5.** Parameter "tags" has neither schema nor content defined

- **📍 Location:** `/pet/findByTags` → `get` → `parameters[0]`
- **💡 Suggestion:** Define either a schema or content for the parameter

**6.** Parameter "petId" has neither schema nor content defined

- **📍 Location:** `/pet/{petId}` → `get` → `parameters[0]`
- **💡 Suggestion:** Define either a schema or content for the parameter

**7.** Parameter "petId" has neither schema nor content defined

- **📍 Location:** `/pet/{petId}` → `post` → `parameters[0]`
- **💡 Suggestion:** Define either a schema or content for the parameter

**8.** Parameter "name" has neither schema nor content defined

- **📍 Location:** `/pet/{petId}` → `post` → `parameters[1]`
- **💡 Suggestion:** Define either a schema or content for the parameter

**9.** Parameter "status" has neither schema nor content defined

- **📍 Location:** `/pet/{petId}` → `post` → `parameters[2]`
- **💡 Suggestion:** Define either a schema or content for the parameter

**10.** Parameter "api\_key" has neither schema nor content defined

- **📍 Location:** `/pet/{petId}` → `delete` → `parameters[0]`
- **💡 Suggestion:** Define either a schema or content for the parameter

**11.** Parameter "petId" has neither schema nor content defined

- **📍 Location:** `/pet/{petId}` → `delete` → `parameters[1]`
- **💡 Suggestion:** Define either a schema or content for the parameter

**12.** Parameter "orderId" has neither schema nor content defined

- **📍 Location:** `/store/order/{orderId}` → `get` → `parameters[0]`
- **💡 Suggestion:** Define either a schema or content for the parameter

**13.** Parameter "orderId" has neither schema nor content defined

- **📍 Location:** `/store/order/{orderId}` → `delete` → `parameters[0]`
- **💡 Suggestion:** Define either a schema or content for the parameter

**14.** Parameter "username" has neither schema nor content defined

- **📍 Location:** `/user/{username}` → `get` → `parameters[0]`
- **💡 Suggestion:** Define either a schema or content for the parameter

**15.** Parameter "username" has neither schema nor content defined

- **📍 Location:** `/user/{username}` → `put` → `parameters[0]`
- **💡 Suggestion:** Define either a schema or content for the parameter

**16.** Parameter "username" has neither schema nor content defined

- **📍 Location:** `/user/{username}` → `delete` → `parameters[0]`
- **💡 Suggestion:** Define either a schema or content for the parameter

**17.** Parameter "username" has neither schema nor content defined

- **📍 Location:** `/user/login` → `get` → `parameters[0]`
- **💡 Suggestion:** Define either a schema or content for the parameter

**18.** Parameter "password" has neither schema nor content defined

- **📍 Location:** `/user/login` → `get` → `parameters[1]`
- **💡 Suggestion:** Define either a schema or content for the parameter

---

### 🔴 Descriptions & Documentation

**Score:** 0/20 (0%) | **Status:** 🔴 Needs Improvement  
**Weight:** 20% | **Weighted Score:** 0.0

#### 🔍 Issues Found (12)

##### 🟡 Medium Issues (12)

**1.** Operation POST /pet/\{petId\}/uploadImage has no description

- **📍 Location:** `/pet/{petId}/uploadImage` → `post` → `description`
- **💡 Suggestion:** Add a detailed description explaining what the operation does, expected behavior, and side effects

**2.** Operation POST /pet has no description

- **📍 Location:** `/pet` → `post` → `description`
- **💡 Suggestion:** Add a detailed description explaining what the operation does, expected behavior, and side effects

**3.** Operation PUT /pet has no description

- **📍 Location:** `/pet` → `put` → `description`
- **💡 Suggestion:** Add a detailed description explaining what the operation does, expected behavior, and side effects

**4.** Operation POST /pet/\{petId\} has no description

- **📍 Location:** `/pet/{petId}` → `post` → `description`
- **💡 Suggestion:** Add a detailed description explaining what the operation does, expected behavior, and side effects

**5.** Operation DELETE /pet/\{petId\} has no description

- **📍 Location:** `/pet/{petId}` → `delete` → `description`
- **💡 Suggestion:** Add a detailed description explaining what the operation does, expected behavior, and side effects

**6.** Parameter "api\_key" has no description

- **📍 Location:** `/pet/{petId}` → `delete` → `parameters[0] (api_key in header)`
- **💡 Suggestion:** Add a clear description explaining the parameter purpose, constraints, and format

**7.** Operation POST /store/order has no description

- **📍 Location:** `/store/order` → `post` → `description`
- **💡 Suggestion:** Add a detailed description explaining what the operation does, expected behavior, and side effects

**8.** Operation POST /user/createWithList has no description

- **📍 Location:** `/user/createWithList` → `post` → `description`
- **💡 Suggestion:** Add a detailed description explaining what the operation does, expected behavior, and side effects

**9.** Operation GET /user/\{username\} has no description

- **📍 Location:** `/user/{username}` → `get` → `description`
- **💡 Suggestion:** Add a detailed description explaining what the operation does, expected behavior, and side effects

**10.** Operation GET /user/login has no description

- **📍 Location:** `/user/login` → `get` → `description`
- **💡 Suggestion:** Add a detailed description explaining what the operation does, expected behavior, and side effects

**11.** Operation GET /user/logout has no description

- **📍 Location:** `/user/logout` → `get` → `description`
- **💡 Suggestion:** Add a detailed description explaining what the operation does, expected behavior, and side effects

**12.** Operation POST /user/createWithArray has no description

- **📍 Location:** `/user/createWithArray` → `post` → `description`
- **💡 Suggestion:** Add a detailed description explaining what the operation does, expected behavior, and side effects

---

### 🔴 Paths & Operations

**Score:** 1/15 (7%) | **Status:** 🔴 Needs Improvement  
**Weight:** 15% | **Weighted Score:** 1.0

#### 🔍 Issues Found (13)

##### 🟡 Medium Issues (1)

**1.** Using PUT on a collection resource

- **📍 Location:** `/pet` → `put` → ``
- **💡 Suggestion:** PUT/PATCH should typically be used on individual resources, not collections

##### 🟢 Low Issues (12)

**1.** Path segment "uploadImage" does not follow kebab\-case naming convention

- **📍 Location:** `/pet/{petId}/uploadImage` → `uploadImage`
- **💡 Suggestion:** Use kebab\-case \(lowercase with hyphens\) for path segments

**2.** Path segment "findByStatus" does not follow kebab\-case naming convention

- **📍 Location:** `/pet/findByStatus` → `findByStatus`
- **💡 Suggestion:** Use kebab\-case \(lowercase with hyphens\) for path segments

**3.** Path segment "findByTags" does not follow kebab\-case naming convention

- **📍 Location:** `/pet/findByTags` → `findByTags`
- **💡 Suggestion:** Use kebab\-case \(lowercase with hyphens\) for path segments

**4.** Path segment "createWithList" does not follow kebab\-case naming convention

- **📍 Location:** `/user/createWithList` → `createWithList`
- **💡 Suggestion:** Use kebab\-case \(lowercase with hyphens\) for path segments

**5.** Path segment "createWithArray" does not follow kebab\-case naming convention

- **📍 Location:** `/user/createWithArray` → `createWithArray`
- **💡 Suggestion:** Use kebab\-case \(lowercase with hyphens\) for path segments

**6.** OperationId "uploadFile" does not indicate the HTTP method \(POST\)

- **📍 Location:** `/pet/{petId}/uploadImage` → `post` → `operationId`
- **💡 Suggestion:** Consider prefixing operationId with create/, /add/, /post/, /insert to indicate the operation type

**7.** OperationId "findPetsByStatus" does not indicate the HTTP method \(GET\)

- **📍 Location:** `/pet/findByStatus` → `get` → `operationId`
- **💡 Suggestion:** Consider prefixing operationId with get/, /read/, /fetch/, /list/, /retrieve to indicate the operation type

**8.** OperationId "findPetsByTags" does not indicate the HTTP method \(GET\)

- **📍 Location:** `/pet/findByTags` → `get` → `operationId`
- **💡 Suggestion:** Consider prefixing operationId with get/, /read/, /fetch/, /list/, /retrieve to indicate the operation type

**9.** OperationId "updatePetWithForm" does not indicate the HTTP method \(POST\)

- **📍 Location:** `/pet/{petId}` → `post` → `operationId`
- **💡 Suggestion:** Consider prefixing operationId with create/, /add/, /post/, /insert to indicate the operation type

**10.** OperationId "placeOrder" does not indicate the HTTP method \(POST\)

- **📍 Location:** `/store/order` → `post` → `operationId`
- **💡 Suggestion:** Consider prefixing operationId with create/, /add/, /post/, /insert to indicate the operation type

**11.** OperationId "loginUser" does not indicate the HTTP method \(GET\)

- **📍 Location:** `/user/login` → `get` → `operationId`
- **💡 Suggestion:** Consider prefixing operationId with get/, /read/, /fetch/, /list/, /retrieve to indicate the operation type

**12.** OperationId "logoutUser" does not indicate the HTTP method \(GET\)

- **📍 Location:** `/user/logout` → `get` → `operationId`
- **💡 Suggestion:** Consider prefixing operationId with get/, /read/, /fetch/, /list/, /retrieve to indicate the operation type

---

### 🔴 Response Codes

**Score:** 0/15 (0%) | **Status:** 🔴 Needs Improvement  
**Weight:** 15% | **Weighted Score:** 0.0

#### 🔍 Issues Found (40)

##### 🟠 High Issues (7)

**1.** Operation is missing success response codes \(2xx\)

- **📍 Location:** `/pet` → `post` → `responses`
- **💡 Suggestion:** Add appropriate success response codes \(e\.g\., 200, 201, 204\)

**2.** Operation is missing success response codes \(2xx\)

- **📍 Location:** `/pet` → `put` → `responses`
- **💡 Suggestion:** Add appropriate success response codes \(e\.g\., 200, 201, 204\)

**3.** Operation is missing success response codes \(2xx\)

- **📍 Location:** `/pet/{petId}` → `post` → `responses`
- **💡 Suggestion:** Add appropriate success response codes \(e\.g\., 200, 201, 204\)

**4.** Operation is missing success response codes \(2xx\)

- **📍 Location:** `/pet/{petId}` → `delete` → `responses`
- **💡 Suggestion:** Add appropriate success response codes \(e\.g\., 200, 201, 204\)

**5.** Operation is missing success response codes \(2xx\)

- **📍 Location:** `/store/order/{orderId}` → `delete` → `responses`
- **💡 Suggestion:** Add appropriate success response codes \(e\.g\., 200, 201, 204\)

**6.** Operation is missing success response codes \(2xx\)

- **📍 Location:** `/user/{username}` → `put` → `responses`
- **💡 Suggestion:** Add appropriate success response codes \(e\.g\., 200, 201, 204\)

**7.** Operation is missing success response codes \(2xx\)

- **📍 Location:** `/user/{username}` → `delete` → `responses`
- **💡 Suggestion:** Add appropriate success response codes \(e\.g\., 200, 201, 204\)

##### 🟡 Medium Issues (14)

**1.** Operation is missing client error response codes \(4xx\)

- **📍 Location:** `/pet/{petId}/uploadImage` → `post` → `responses`
- **💡 Suggestion:** Add appropriate client error response codes \(e\.g\., 400, 401, 404\)

**2.** POST operation for resource creation should return 201 Created

- **📍 Location:** `/pet/{petId}/uploadImage` → `post` → `responses`
- **💡 Suggestion:** Add a 201 Created response for resource creation operations

**3.** POST operation for resource creation should return 201 Created

- **📍 Location:** `/pet` → `post` → `responses`
- **💡 Suggestion:** Add a 201 Created response for resource creation operations

**4.** PUT operation should return 200 OK or 204 No Content

- **📍 Location:** `/pet` → `put` → `responses`
- **💡 Suggestion:** Add appropriate success response code \(200 or 204\) based on whether content is returned

**5.** Operation is missing client error response codes \(4xx\)

- **📍 Location:** `/store/inventory` → `get` → `responses`
- **💡 Suggestion:** Add appropriate client error response codes \(e\.g\., 400, 401, 404\)

**6.** POST operation for resource creation should return 201 Created

- **📍 Location:** `/store/order` → `post` → `responses`
- **💡 Suggestion:** Add a 201 Created response for resource creation operations

**7.** Operation is missing client error response codes \(4xx\)

- **📍 Location:** `/user/createWithList` → `post` → `responses`
- **💡 Suggestion:** Add appropriate client error response codes \(e\.g\., 400, 401, 404\)

**8.** POST operation for resource creation should return 201 Created

- **📍 Location:** `/user/createWithList` → `post` → `responses`
- **💡 Suggestion:** Add a 201 Created response for resource creation operations

**9.** PUT operation should return 200 OK or 204 No Content

- **📍 Location:** `/user/{username}` → `put` → `responses`
- **💡 Suggestion:** Add appropriate success response code \(200 or 204\) based on whether content is returned

**10.** Operation is missing client error response codes \(4xx\)

- **📍 Location:** `/user/logout` → `get` → `responses`
- **💡 Suggestion:** Add appropriate client error response codes \(e\.g\., 400, 401, 404\)

**11.** Operation is missing client error response codes \(4xx\)

- **📍 Location:** `/user/createWithArray` → `post` → `responses`
- **💡 Suggestion:** Add appropriate client error response codes \(e\.g\., 400, 401, 404\)

**12.** POST operation for resource creation should return 201 Created

- **📍 Location:** `/user/createWithArray` → `post` → `responses`
- **💡 Suggestion:** Add a 201 Created response for resource creation operations

**13.** Operation is missing client error response codes \(4xx\)

- **📍 Location:** `/user` → `post` → `responses`
- **💡 Suggestion:** Add appropriate client error response codes \(e\.g\., 400, 401, 404\)

**14.** POST operation for resource creation should return 201 Created

- **📍 Location:** `/user` → `post` → `responses`
- **💡 Suggestion:** Add a 201 Created response for resource creation operations

##### 🟢 Low Issues (19)

**1.** Operation is missing server error handling \(5xx or default\)

- **📍 Location:** `/pet/{petId}/uploadImage` → `post` → `responses`
- **💡 Suggestion:** Add server error responses \(5xx\) or a default response

**2.** Operation is missing server error handling \(5xx or default\)

- **📍 Location:** `/pet` → `post` → `responses`
- **💡 Suggestion:** Add server error responses \(5xx\) or a default response

**3.** Operation is missing server error handling \(5xx or default\)

- **📍 Location:** `/pet` → `put` → `responses`
- **💡 Suggestion:** Add server error responses \(5xx\) or a default response

**4.** Operation is missing server error handling \(5xx or default\)

- **📍 Location:** `/pet/findByStatus` → `get` → `responses`
- **💡 Suggestion:** Add server error responses \(5xx\) or a default response

**5.** Operation is missing server error handling \(5xx or default\)

- **📍 Location:** `/pet/findByTags` → `get` → `responses`
- **💡 Suggestion:** Add server error responses \(5xx\) or a default response

**6.** Operation is missing server error handling \(5xx or default\)

- **📍 Location:** `/pet/{petId}` → `get` → `responses`
- **💡 Suggestion:** Add server error responses \(5xx\) or a default response

**7.** Operation is missing server error handling \(5xx or default\)

- **📍 Location:** `/pet/{petId}` → `post` → `responses`
- **💡 Suggestion:** Add server error responses \(5xx\) or a default response

**8.** Operation is missing server error handling \(5xx or default\)

- **📍 Location:** `/pet/{petId}` → `delete` → `responses`
- **💡 Suggestion:** Add server error responses \(5xx\) or a default response

**9.** DELETE operation should typically return 204 No Content

- **📍 Location:** `/pet/{petId}` → `delete` → `responses`
- **💡 Suggestion:** Consider using 204 No Content for DELETE operations

**10.** Operation is missing server error handling \(5xx or default\)

- **📍 Location:** `/store/inventory` → `get` → `responses`
- **💡 Suggestion:** Add server error responses \(5xx\) or a default response

**11.** Operation is missing server error handling \(5xx or default\)

- **📍 Location:** `/store/order` → `post` → `responses`
- **💡 Suggestion:** Add server error responses \(5xx\) or a default response

**12.** Operation is missing server error handling \(5xx or default\)

- **📍 Location:** `/store/order/{orderId}` → `get` → `responses`
- **💡 Suggestion:** Add server error responses \(5xx\) or a default response

**13.** Operation is missing server error handling \(5xx or default\)

- **📍 Location:** `/store/order/{orderId}` → `delete` → `responses`
- **💡 Suggestion:** Add server error responses \(5xx\) or a default response

**14.** DELETE operation should typically return 204 No Content

- **📍 Location:** `/store/order/{orderId}` → `delete` → `responses`
- **💡 Suggestion:** Consider using 204 No Content for DELETE operations

**15.** Operation is missing server error handling \(5xx or default\)

- **📍 Location:** `/user/{username}` → `get` → `responses`
- **💡 Suggestion:** Add server error responses \(5xx\) or a default response

**16.** Operation is missing server error handling \(5xx or default\)

- **📍 Location:** `/user/{username}` → `put` → `responses`
- **💡 Suggestion:** Add server error responses \(5xx\) or a default response

**17.** Operation is missing server error handling \(5xx or default\)

- **📍 Location:** `/user/{username}` → `delete` → `responses`
- **💡 Suggestion:** Add server error responses \(5xx\) or a default response

**18.** DELETE operation should typically return 204 No Content

- **📍 Location:** `/user/{username}` → `delete` → `responses`
- **💡 Suggestion:** Consider using 204 No Content for DELETE operations

**19.** Operation is missing server error handling \(5xx or default\)

- **📍 Location:** `/user/login` → `get` → `responses`
- **💡 Suggestion:** Add server error responses \(5xx\) or a default response

---

### 🔴 Examples & Samples

**Score:** 3/10 (30%) | **Status:** 🔴 Needs Improvement  
**Weight:** 10% | **Weighted Score:** 3.0

#### 🔍 Issues Found (7)

##### 🟢 Low Issues (7)

**1.** Required parameter "body" \(in body\) lacks examples

- **📍 Location:** `/pet` → `post` → `parameters.body`
- **💡 Suggestion:** Add an example to help consumers understand expected parameter values

**2.** Required parameter "body" \(in body\) lacks examples

- **📍 Location:** `/pet` → `put` → `parameters.body`
- **💡 Suggestion:** Add an example to help consumers understand expected parameter values

**3.** Required parameter "body" \(in body\) lacks examples

- **📍 Location:** `/store/order` → `post` → `parameters.body`
- **💡 Suggestion:** Add an example to help consumers understand expected parameter values

**4.** Required parameter "body" \(in body\) lacks examples

- **📍 Location:** `/user/createWithList` → `post` → `parameters.body`
- **💡 Suggestion:** Add an example to help consumers understand expected parameter values

**5.** Required parameter "body" \(in body\) lacks examples

- **📍 Location:** `/user/{username}` → `put` → `parameters.body`
- **💡 Suggestion:** Add an example to help consumers understand expected parameter values

**6.** Required parameter "body" \(in body\) lacks examples

- **📍 Location:** `/user/createWithArray` → `post` → `parameters.body`
- **💡 Suggestion:** Add an example to help consumers understand expected parameter values

**7.** Required parameter "body" \(in body\) lacks examples

- **📍 Location:** `/user` → `post` → `parameters.body`
- **💡 Suggestion:** Add an example to help consumers understand expected parameter values

---

### 🔴 Security

**Score:** 0/10 (0%) | **Status:** 🔴 Needs Improvement  
**Weight:** 10% | **Weighted Score:** 0.0

#### 🔍 Issues Found (12)

##### 🟠 High Issues (7)

**1.** POST operation has no security requirements

- **📍 Location:** `/store/order` → `post` → `security`
- **💡 Suggestion:** Add security requirements for write operations

**2.** DELETE operation has no security requirements

- **📍 Location:** `/store/order/{orderId}` → `delete` → `security`
- **💡 Suggestion:** Add security requirements for write operations

**3.** POST operation has no security requirements

- **📍 Location:** `/user/createWithList` → `post` → `security`
- **💡 Suggestion:** Add security requirements for write operations

**4.** PUT operation has no security requirements

- **📍 Location:** `/user/{username}` → `put` → `security`
- **💡 Suggestion:** Add security requirements for write operations

**5.** DELETE operation has no security requirements

- **📍 Location:** `/user/{username}` → `delete` → `security`
- **💡 Suggestion:** Add security requirements for write operations

**6.** POST operation has no security requirements

- **📍 Location:** `/user/createWithArray` → `post` → `security`
- **💡 Suggestion:** Add security requirements for write operations

**7.** POST operation has no security requirements

- **📍 Location:** `/user` → `post` → `security`
- **💡 Suggestion:** Add security requirements for write operations

##### 🟡 Medium Issues (5)

**1.** No global security requirements defined

- **📍 Location:** `root` → `security`
- **💡 Suggestion:** Define global security requirements to ensure all endpoints are secured by default

**2.** GET operation has no security requirements

- **📍 Location:** `/store/order/{orderId}` → `get` → `security`
- **💡 Suggestion:** Consider adding security requirements

**3.** GET operation has no security requirements

- **📍 Location:** `/user/{username}` → `get` → `security`
- **💡 Suggestion:** Consider adding security requirements

**4.** GET operation has no security requirements

- **📍 Location:** `/user/login` → `get` → `security`
- **💡 Suggestion:** Consider adding security requirements

**5.** GET operation has no security requirements

- **📍 Location:** `/user/logout` → `get` → `security`
- **💡 Suggestion:** Consider adding security requirements

---

### 🟡 Miscellaneous Best Practices

**Score:** 8/10 (80%) | **Status:** 🟡 Good  
**Weight:** 10% | **Weighted Score:** 8.0

#### 🔍 Issues Found (1)

##### 🟡 Medium Issues (1)

**1.** No servers defined in the API

- **📍 Location:** `root` → `servers`
- **💡 Suggestion:** Add at least one server URL to help consumers understand where the API is deployed

---

## 🎯 Recommendations

### ⚠️ **Quality Alert**

Your overall score of **12/100** is below the acceptable threshold. Consider:

1. **Immediate Action:** Address all critical and high-priority issues
2. **Documentation Review:** Ensure all endpoints have proper descriptions
3. **Schema Validation:** Add proper data types and validation rules
4. **Best Practices:** Follow OpenAPI specification guidelines

### 🔧 **Focus Area: Schema & Types**

This category scored **0/20** (0%) and needs attention.

### 💡 **General Tips for Better API Documentation**

1. **Complete Descriptions:** Ensure every endpoint, parameter, and response has meaningful descriptions
2. **Proper Examples:** Include request/response examples for all major operations  
3. **Consistent Naming:** Use clear, consistent naming conventions for paths and operations
4. **Error Handling:** Define appropriate HTTP status codes for all scenarios
5. **Security:** Implement and document proper authentication/authorization
6. **Versioning:** Use semantic versioning and document API changes

---

## 📞 Need Help?

- 📧 **Support:** support@theneo.io
- 🌐 **Website:** [theneo.io](https://theneo.io)
- 📚 **Documentation:** [docs.theneo.io](https://docs.theneo.io)
- 🐛 **Issues:** [GitHub Issues](https://github.com/theneo-io/openapi-scorer/issues)

---

<div align="center">

**🚀 Generated by [Theneo OpenAPI Scorer](https://theneo.io)**  
*Helping developers create better APIs, one specification at a time.*

</div>
