import type { Guide } from '@bedge/shared';

/**
 * The makeup artist's guide.
 *
 * Every bolded string is copied verbatim from the screen it refers to. A
 * guide that says "tap Add" when the button says "Add service" is worse than
 * no guide - the reader concludes they are on the wrong screen.
 */
export const ARTIST_GUIDE: Guide = {
  id: 'artist',
  title: 'Artist guide',
  intro:
    'Everything you can do from your dashboard, in the order you will need it - '
    + 'from setting up your first service to getting paid.',
  sections: [
    {
      id: 'start',
      title: 'Getting started',
      blurb: 'Once, at the beginning. Ten minutes.',
      topics: [
        {
          id: 'apply',
          title: 'Create your account and get approved',
          summary: 'Register, describe your business, and wait for the B-Edge team to review you.',
          steps: [
            'Open the dashboard and choose **Sign up**.',
            'Enter your name, email, phone number and a password.',
            'On **Your business**, enter your business name and pick a **Category** (for example Makeup, Hair, Nails or Lashes).',
            'Choose your **Handle**. This becomes your public web address, so pick something short and recognisable - it is how clients will find and share your page.',
            'Add **Your first service** so your page is not empty when it goes live. You can change it later and add as many more as you like.',
            'Submit. You will see **Your application is under review**.',
          ],
          notes: [
            'While your application is under review you can sign in, but only your Profile screen is available. Everything else unlocks on approval.',
            'If you see **Your application wasn\'t approved**, the reason is shown on that screen. You can correct the details and submit again.',
            'Your handle cannot be changed after approval without contacting support, because links already shared with clients would break.',
          ],
        },
        {
          id: 'profile',
          title: 'Set up your public profile',
          summary: 'Your photo, bio and Instagram - this is what clients see before they book.',
          steps: [
            'Go to **Profile**.',
            'Hover or tap your avatar to upload a photo. Use a clear picture of your face or your logo.',
            'Under **Public profile**, write a short bio. Two or three sentences is plenty: what you specialise in, and where you work.',
            'Add your Instagram handle so clients can see more of your work.',
            'Save.',
          ],
          notes: [
            'Photos are resized before upload, so a large photo straight from your phone is fine.',
          ],
        },
      ],
    },
    {
      id: 'catalogue',
      title: 'Your services and hours',
      blurb: 'What you offer, where, and when. Get this right and bookings look after themselves.',
      topics: [
        {
          id: 'add-service',
          title: 'Add a new service',
          summary: 'Name, how long it takes, what it costs, and how much deposit you want up front.',
          steps: [
            'Go to **Services**.',
            'Open **Add service**.',
            'Enter the **Name** as a client would recognise it - for example "Bridal Makeup", not "BM-1".',
            'Add a **Description (optional)**. One line on who it is for and what is included.',
            'Set **Duration (min)** - how long you are actually with the client.',
            'Set **Cleanup after (min)** if you need time to reset between clients. This is blocked out in your calendar but is never shown to the client and is not charged.',
            'Set the **Price (USD)**.',
            'Set the **Deposit (USD)** you want before you confirm the booking. Leave it at 0 if you do not take deposits for this service.',
            'Choose **Save service**.',
          ],
          notes: [
            'Prices and deposits are in US dollars and take at most two decimal places - 45 or 45.50, not 45.999.',
            'The deposit must not be more than the price.',
            'Duration plus cleanup time is what actually blocks your calendar, so a 60-minute service with 15 minutes cleanup fills a 75-minute slot.',
          ],
        },
        {
          id: 'edit-service',
          title: 'Change or retire a service',
          summary: 'Edit the details, or switch it off without deleting your history.',
          steps: [
            'Go to **Services** and choose the service.',
            'Change whatever you need, then **Save**.',
            'To stop taking new bookings for it, switch its status from **Active** to **Inactive**.',
          ],
          notes: [
            'Making a service inactive hides it from clients but keeps every past booking intact, along with what was actually charged at the time.',
            'Changing the price never changes bookings that already exist. Clients pay what they were quoted.',
          ],
        },
        {
          id: 'add-store',
          title: 'Add a location',
          summary: 'A salon, a studio, or anywhere else you work from.',
          steps: [
            'Go to **Hours**.',
            'Choose **Add store**.',
            'Enter the **Store name** (for example "Beirut Downtown") and the **City**.',
            'Choose **Save**.',
          ],
          notes: [
            'Each location keeps its own opening hours, so a weekend-only studio does not affect your main salon.',
            'If you work at more than one location on the same day, B-Edge automatically leaves travel time between bookings at different addresses.',
          ],
        },
        {
          id: 'hours',
          title: 'Set your opening hours',
          summary: 'The weekly pattern clients can book inside.',
          steps: [
            'Go to **Hours** and pick the location you are setting up.',
            'For each **Day**, set the status to **Open** or **Closed**.',
            'On open days, set the opening and closing time.',
            'Choose **Save changes**.',
          ],
          notes: [
            'Clients can only ever book inside these hours, so this is your main protection against appointments landing at 7am.',
            'A booking must fit entirely inside the day - a 90-minute service cannot start 30 minutes before you close.',
          ],
        },
        {
          id: 'special-hours',
          title: 'Close for a day, or work unusual hours',
          summary: 'Holidays, weddings, a late night - without touching your normal week.',
          steps: [
            'Go to **Hours** and scroll to **Special hours**.',
            'Choose **Add special hours**.',
            'Pick the **Date**.',
            'Choose **Closed** for a day off, or **Custom hours** and set the times you are working.',
            'Add a **Reason (optional)** so you remember why in three months.',
            'Choose **Add**.',
          ],
          notes: [
            'Special hours always beat your normal weekly hours for that date.',
            'This does not cancel bookings you already have on that day. Existing appointments stay, and you will need to contact those clients yourself.',
          ],
        },
      ],
    },
    {
      id: 'bookings',
      title: 'Bookings',
      blurb: 'Requests arrive, you approve them, you get paid.',
      topics: [
        {
          id: 'approve',
          title: 'Approve or decline a booking request',
          summary: 'New requests arrive as Pending and wait for you.',
          steps: [
            'Go to **Bookings**. New requests show as **Pending**.',
            'Check the service, date, time and location.',
            'Choose **Approve** to confirm it. The client is notified.',
            'To decline, choose **Cancel**, add a **Reason (optional)**, and confirm with **Yes, cancel**.',
          ],
          notes: [
            'Nothing is held for you until you approve. Two clients can request the same slot, but only the first approval takes it - the other cannot be approved on top of it.',
            'Declining is not the same as a client cancelling, and both are kept separately in your history.',
          ],
        },
        {
          id: 'deposit',
          title: 'Confirm you received a deposit',
          summary: 'The client sends the deposit by OMT or Whish, and you record it here.',
          steps: [
            'Go to **Deposits**. Anything waiting on you appears under **Urgent action pending**.',
            'Check your OMT or Whish account for the transfer.',
            'On the booking, choose **Verify deposit**.',
            'Optionally record the **Transaction ref or notes** - for example "Whish Code #94821". This is only for you, and it is what you will look for if there is ever a dispute.',
            'Confirm.',
          ],
          notes: [
            'B-Edge never holds your money. Deposits go directly from the client to you, and this screen only records that it arrived.',
            'Record the reference. It is the only evidence linking a transfer to a booking.',
          ],
        },
        {
          id: 'no-show',
          title: 'Mark a no-show',
          summary: 'The client never arrived.',
          steps: [
            'Go to **Bookings** and find the appointment.',
            'Choose **No show**.',
          ],
          notes: [
            'Keep this accurate. It is part of a client\'s history, and it is what you will check before accepting a large booking from someone who has let you down before.',
          ],
        },
        {
          id: 'cancel-refund',
          title: 'Cancel a booking and return a deposit',
          summary: 'When you have to cancel, and money has already changed hands.',
          steps: [
            'Go to **Bookings** and find the appointment.',
            'Choose **Cancel**, add a **Reason (optional)**, and confirm with **Yes, cancel**.',
            'If you had already taken a deposit, send it back by OMT or Whish.',
            'Choose **Mark refunded**, add the **Reference, e.g. Whish #94821 (optional)**, and confirm with **Yes, refunded**.',
          ],
          notes: [
            'Marking a booking refunded records that you sent the money back. It does not move any money by itself.',
          ],
        },
        {
          id: 'calendar',
          title: 'See your day at a glance',
          summary: 'The calendar, and what the red line means.',
          steps: [
            'Go to **Calendar**.',
            'Move between days to see your appointments laid out by time.',
            'Tap any appointment to open it.',
          ],
          notes: [
            'The red line across the calendar is the current time.',
            'Blocked-out time after a booking is the cleanup time set on that service.',
          ],
        },
        {
          id: 'waitlist',
          title: 'Fill a cancelled slot from the waitlist',
          summary: 'Clients who wanted a full day and asked to be told if it opens up.',
          steps: [
            'Go to **Waitlist** to see who is waiting and for what.',
            'When a slot frees up, the next person waiting is offered it automatically and has a limited time to confirm.',
            'If they do not confirm in time, the offer passes to the next person.',
          ],
          notes: [
            'You do not need to do anything for this to work - it runs on its own whenever a booking is cancelled or marked a no-show.',
            '**Nobody\'s waiting right now** simply means no one has joined the waitlist yet.',
          ],
        },
      ],
    },
    {
      id: 'money',
      title: 'Money and promotions',
      blurb: 'What you earned, and how to bring people in.',
      topics: [
        {
          id: 'earnings',
          title: 'Check what you earned',
          summary: 'Revenue and booking counts by month.',
          steps: [
            'Go to **Earnings**.',
            'The figure at the top is your revenue for the month shown, with the number of bookings underneath.',
            'Change the month to look back.',
          ],
          notes: [
            'Earnings count what was actually charged after any discount, not the list price.',
          ],
        },
        {
          id: 'promo',
          title: 'Create a promo code',
          summary: 'A code you hand out on Instagram or a poster.',
          steps: [
            'Go to **Promos**.',
            'Choose **New code**.',
            'Enter the **Code** clients will type - for example SUMMER20. Short and easy to say out loud works best.',
            'Add a description like "Instagram launch offer" so you remember what it was for.',
            'Pick the **Type**: **Percentage** off, or a **Fixed amount** off.',
            'Enter the value.',
            'Tick **New clients** if only people who have never booked with you may use it.',
            'Set a maximum number of uses, or leave it **Unlimited**.',
            'Optionally set an end date.',
            'Save.',
          ],
          notes: [
            'A code cannot be renamed after it is created. Clients have it written down, and renaming would silently break every poster and story you have already shared - deactivate it and make a new one instead.',
            'Codes cannot be deleted either, because bookings that used one need to keep the explanation of what was charged. Deactivating stops it working and keeps the history.',
            'Only one promo code applies per booking, and a discount never reduces a booking below its deposit.',
            'A code used on a booking that is later cancelled goes back into circulation.',
          ],
        },
        {
          id: 'products',
          title: 'Sell a product',
          summary: 'Retail items clients can order from your shop page.',
          steps: [
            'Go to **Products**.',
            'Choose **Add product**.',
            'Enter the **Product name**, a **Category**, and a **Price**.',
            'Describe it - **What is it, and who is it for?**',
            'Upload a photo. **PNG or JPG, up to 10MB**.',
            'Optionally set how many you have, or **Leave blank for unlimited**.',
            'Save.',
          ],
          notes: [
            'Use **Show inactive** to see products you have switched off.',
          ],
        },
        {
          id: 'orders',
          title: 'Fulfil a product order',
          summary: 'A client ordered something and is sending payment.',
          steps: [
            'Go to **Orders**.',
            'Check your OMT or Whish account for the client\'s transfer.',
            'Confirm the order once the money has arrived.',
            'Arrange delivery to the address on the order.',
          ],
        },
      ],
    },
    {
      id: 'reputation',
      title: 'Reviews',
      blurb: 'What clients say afterwards.',
      topics: [
        {
          id: 'reviews',
          title: 'Read your reviews',
          summary: 'Two separate scores: you, and the salon.',
          steps: [
            'Go to **Reviews**.',
            'Each review shows a rating for **You** and a rating for the **Salon**.',
          ],
          notes: [
            'The two scores are deliberately independent. A client can love your work and still have found the venue hard to park at, and neither score is calculated from the other.',
            'Reviews can only be left by someone who actually had an appointment, through a private link sent after the visit.',
          ],
        },
      ],
    },
    {
      id: 'safety',
      title: 'Protecting your business',
      blurb: 'The scams that target artists, and what the platform already does about them.',
      topics: [
        {
          id: 'fake-bookings',
          title: 'Spotting a fake booking',
          summary: 'A request that blocks your best slot and never arrives.',
          steps: [
            'Before approving a large or unusual request, look at the details: a name that reads oddly, an unreachable number, a booking for your most valuable slot from someone with no history.',
            'Message the client on WhatsApp before you approve. A real client answers.',
            'Ask for the deposit before confirming. It is the single most effective filter there is.',
            'If they will not confirm or pay, decline the request rather than leaving the slot held.',
          ],
          notes: [
            'Nothing is held until you approve, so an unapproved request is not costing you the slot yet - but approving one that never pays does.',
            'A client\'s history is on their record in **Clients**, including any no-shows. Check it before accepting a large booking from someone who has let you down before.',
          ],
        },
        {
          id: 'payment-details',
          title: 'Set where clients should pay you',
          summary: 'So B-Edge shows your details instead of you sending a number by message.',
          steps: [
            'Go to **Profile** and find **Getting paid**.',
            'Choose **Add** next to **Whish** or **OMT**.',
            'Enter the **Account name** exactly as it appears on your account. Clients see this name when they confirm a transfer, so a mismatch is what tells them something is wrong.',
            'Enter your phone number for Whish, or your account reference for OMT.',
            'Save. Clients are now shown these details when a deposit is due.',
            'If you stop using an account, choose **Stop using** rather than leaving it. It disappears from client screens immediately.',
          ],
          notes: [
            'Until you set this, clients have nowhere to send a deposit and you have to message them a number - which is exactly where payment scams happen, because there is nothing for them to check it against.',
            'You can have one Whish account and one OMT account. Saving again replaces the existing one rather than adding a second, so there is never any doubt about which is correct.',
            'The same details are used for product orders.',
          ],
        },
        {
          id: 'payment-safety',
          title: 'Deposits and payment safety',
          summary: 'What to check before you treat a deposit as received.',
          steps: [
            'Only mark a deposit received once you have seen it in your own OMT or Whish account. A screenshot is not proof - screenshots are trivial to fake.',
            'Record the transaction reference when you verify it. It is what you will look for if there is ever a dispute.',
            'Never send money back to anyone who claims they overpaid, until you have confirmed the original transfer cleared in your own account.',
          ],
          notes: [
            'The overpayment scam is common in this industry: a client "accidentally" sends too much and asks for the difference back. The original payment is then reversed or was never real, and the refund is gone.',
            'B-Edge will never ask you for your password, and never asks for payment details by message. Subscription invoices are always paid from **Billing** inside the dashboard.',
          ],
        },
      ],
    },
    {
      id: 'subscription',
      title: 'Your B-Edge subscription',
      blurb: 'What you pay B-Edge to use the platform.',
      topics: [
        {
          id: 'billing',
          title: 'Pay your subscription',
          summary: 'You transfer, then tell us, then an admin confirms.',
          steps: [
            'Go to **Billing**. It shows your plan, the **Amount due**, and your **Invoice history**.',
            'Under **How to pay**, send the amount shown via OMT or Whish to B-Edge\'s account.',
            'Choose **I\'ve paid** and enter your payment reference.',
            'An admin confirms it, usually the same day. Until then the invoice shows as submitted.',
          ],
          notes: [
            'New accounts start on a trial. **Trial ends** on the Billing screen tells you when.',
            'If an invoice goes unpaid your account moves to a grace period, then past due, and eventually your public page stops appearing in search. Nothing is deleted - paying restores everything.',
            'The **Pay now** button in the navigation appears when you have something outstanding.',
          ],
        },
      ],
    },
  ],
};
