# 14.11 Security Architecture & Threat Defense

```mermaid
flowchart TD
    Internet[Public Internet Traffic] --> WAF[Web Application Firewall (Cloudflare WAF / AWS Shield)]
    WAF --> EdgeTLS[TLS 1.3 Termination]
    EdgeTLS --> APIGateway[API Gateway / Ingress Controller]

    subgraph Defense_in_Depth ["Defense in Depth Principles"]
        ZeroTrust["Zero Trust Network Access (mTLS between pods)"]
        LeastPrivilege["Least Privilege IAM Roles"]
        SecretsManagement["HashiCorp Vault / AWS Secrets Manager"]
        Encryption["AES-256 at Rest & TLS 1.3 in Transit"]
    end

    APIGateway --> Defense_in_Depth
    Defense_in_Depth --> BackendServices[Application Pods & Microservices]
    BackendServices --> Database[(Encrypted Database)]
```

---

## 1. Concepts in Plain Words
- **Zero Trust**: A security model operating on the principle of *"never trust, always verify"*. Even internal microservices running inside the same private VPC must authenticate each other using mutual TLS (mTLS).
- **OAuth2 & OpenID Connect (OIDC)**:
  - *OAuth2*: Authorization protocol granting third-party apps scoped access to resources on a user's behalf.
  - *OIDC*: Authentication identity layer built on top of OAuth2 issuing signed JSON Web Tokens (JWTs) containing identity claims.
- **WAF (Web Application Firewall)**: Inspects Layer 7 traffic to block SQL injection, cross-site scripting, and known exploit signatures before packets reach application infrastructure.

---

## 2. Authentication Strategy for Trillo
- **Access Tokens**: Short-lived JWTs (15 minutes expiration) signed with RS256 private keys, verified statelessly by the API Gateway using public JWKS endpoints.
- **Refresh Tokens**: Long-lived (7 days), stored in secure `httpOnly`, `SameSite=Strict`, `Secure` browser cookies. Rotating refresh tokens prevent token theft replay attacks.
- **Role-Based Access Control (RBAC)**: Enforces traveler vs concierge vs property manager permissions.

---

## 3. Threat Modeling & Defense Matrix

| Attack Vector | Threat Level | Defense Implemented / Recommended |
| :--- | :---: | :--- |
| **Volumetric DDoS** | High | Cloudflare Anycast DDoS mitigation absorbs terabits of malicious traffic. |
| **SQL Injection** | Critical | Parameterized queries via PostgreSQL prepared statements / ORM drivers. |
| **Credential Stuffing**| High | IP rate limiting, bot management heuristics, and optional WebAuthn / Passkeys. |
| **Data Exfiltration** | Critical | Database volume encryption (AES-256), encrypted backups, and KMS key rotation. |

---

## 4. 30-Second Spoken Answer
> *"Trillo's security architecture is built on Zero Trust and defense-in-depth principles. At the edge, Cloudflare WAF and DDoS mitigation filter malicious traffic. All internal pod-to-pod communications are secured with mutual TLS via an Envoy service mesh. User authentication utilizes short-lived RS256 JWTs paired with secure httpOnly refresh cookies, while all persistent databases are encrypted at rest with AES-256 managed keys."*
