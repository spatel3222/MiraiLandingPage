# User Onboarding Flow MVP PRD

## L1 Features
+ Organization Creation
+ Team Member Management
+ Approval Workflow
+ Payment & Licensing
+ Promo Code System

## L2 Features

### Organization Creation
+ Mirai team creates Organization
+ Adds Super Admin (1 per org)
+ Org settings configuration

### Team Member Management
+ Super Admin requests new team member
+ Add team member by email/ID
+ Role assignment (Super Admin / Associate)

### Approval Workflow
+ Org Admin sends request for new member
+ Approval notification system
+ Add user to org after approval

### Payment & Licensing
+ Razorpay integration
+ License tiers: 1 or 4 seats
+ Pricing: ₹3,000/license/month
+ Auto-add user after successful payment

### Promo Code System
+ Configurable: discount % OR full bypass
+ Code validation & application
+ Connects to approval flow

---

## User Journey

**Add Team Member:**
```
Org Admin needs member → Request submitted → Approval/Payment → User added to Org
```

**Transfer Super Admin:**
```
Current Admin assigns new Admin → New Admin active → Old Admin demoted (make-before-break)
```

---

## Development Phases

| Phase | Scope | Automation |
|-------|-------|------------|
| **MVP** | Org Creation + Team Request + Manual Approval | Manual (Shivang approves, Arpan adds) |
| **Scaling** | Razorpay + Auto-add | Fully automated after payment |

---

## Pricing Model

| License Tier | Price/Month |
|--------------|-------------|
| 1 seat | ₹3,000 |
| 4 seats | ₹12,000 (4 × ₹3,000) |

---

## Super Admin Transfer Rules

| Rule | Detail |
|------|--------|
| **Make-before-break** | New admin activated before old demoted |
| **Mirai override** | Mirai team can overwrite Super Admin anytime |
| **Minimum 1** | Org must always have at least 1 Super Admin |

---

## Assumptions
+ Razorpay for payment gateway
+ Promo codes configurable per code (% discount or full bypass)
+ Super Admin transferable with make-before-break
+ Mirai team has override capability

---

*PRD Version: 1.0*
*Created: January 2, 2026*
