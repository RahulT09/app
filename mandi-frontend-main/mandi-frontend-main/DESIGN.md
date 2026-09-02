# Design System — storefront identity

**Subject**: general-merchandise online store, India-first (INR, Razorpay, 10-digit
phone numbers, Indian address format). Audience is price-conscious, mobile-first
shoppers. The single job of the storefront is: help someone find a product, trust
the price, and check out without friction. The admin side is a working tool, not a
brand surface — kept quiet and dense by comparison (brand vs. product register).

## Avoiding the defaults
Rejected: cream bg + serif + terracotta (#D97757); near-black + neon accent;
broadsheet hairline-rule layout. Direction instead is **hand-painted market
signage meets a till receipt** — bold functional lettering, a tabular-mono price
treatment, and a die-cut "price tag" shape as the one signature element.

## Color
| Token | Hex | Use |
|---|---|---|
| `ink` | `#16213E` | primary text, dark surfaces |
| `paper` | `#F4F7F3` | page background (cool off-white, not cream) |
| `marigold` | `#F0A202` | primary CTA / brand accent |
| `forest` | `#1F6F5C` | in-stock, success, links |
| `brick` | `#C6432D` | sale / destructive / errors |
| `line` | `#DDE3DC` | borders, dividers |

## Type
- Display (`font-display`): **Bricolage Grotesque** — headlines, nav, buttons, price-tag numerals's label. Bold, hand-signage character.
- Body (`font-sans`): **Manrope** — everything else. Not Inter.
- Mono (`font-mono`): **Space Mono** — prices, SKUs, order numbers, receipts. Tabular.

## Signature element
The **price tag**: a clipped-corner tag shape with a small punched dot, price set
in Space Mono. Used on product cards, cart lines, order totals, checkout summary —
consistently, so it reads as the store's mark rather than a one-off decoration.

## Layout
Standard, highly scannable commerce grid. Section eyebrows are short, uppercase,
wide-tracked signage-style labels (no 01/02/03 numbering — nothing here is a real
sequence). Admin screens use a plain dashboard shell: sidebar + table, minimal
color, dense rows — utility, not performance.
