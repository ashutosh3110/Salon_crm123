### Wallet System Requirements

#### Customer Wallet

* Wallet **Outlet Wise** maintain hoga, overall/global wallet nahi hoga.
* Agar customer ke paas multiple outlets available hain, to har outlet ka wallet balance alag rahega.
* Customer kisi outlet ke wallet balance ko sirf usi outlet me use kar sakta hai.
* Example:

  * Outlet A Wallet Balance: ₹500
  * Outlet B Wallet Balance: ₹300

  Agar customer Outlet A se order karta hai to sirf ₹500 wala balance use hoga. Outlet B ka ₹300 balance use nahi hoga.

#### Admin Wallet Management

* Admin kisi specific outlet ke wallet me amount add kar sakta hai.
* Admin customer ke wallet balance ko outlet wise dekh sakta hai.
* Admin wallet transactions ka history dekh sakta hai.

#### Wallet Transfer Between Outlets

* Admin ke paas ek option hoga jisse wo wallet amount ko ek outlet se dusre outlet me transfer kar sake.
* Transfer karte waqt:

  * Source Outlet select karna hoga.
  * Destination Outlet select karna hoga.
  * Transfer Amount enter karna hoga.
* Transfer ke baad source outlet ka balance reduce hoga aur destination outlet ka balance increase hoga.
* Transfer transaction history me maintain kiya jayega.

#### Example

* Customer Wallet:

  * Outlet A: ₹1000
  * Outlet B: ₹200

* Admin ₹300 Outlet A se Outlet B me transfer karta hai.

* Transfer ke baad:

  * Outlet A: ₹700
  * Outlet B: ₹500

#### Order Payment

* Wallet balance sirf us outlet ke orders ke liye valid hoga jahan wallet amount available hai.
* Checkout ke time system automatically current outlet ka wallet balance use karega.
* Dusre outlet ka wallet balance checkout me consider nahi kiya jayega.

### Super Admin Control

* Admin outlet wise wallet balances manage kar sakta hai.
* Outlet-wise wallet reports aur transaction logs available rahenge.
* Wallet transfer, credit aur debit ki complete audit history maintain ki jayegi.
