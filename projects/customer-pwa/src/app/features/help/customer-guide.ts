import type { Guide } from '@bedge/shared';

/** The client's guide. Shipped inside the customer app. */
export const CUSTOMER_GUIDE: Guide = {
  id: 'customer',
  title: 'Help',
  intro: 'How to find an artist, book an appointment, and manage it afterwards.',
  sections: [
    {
      id: 'booking',
      title: 'Booking an appointment',
      blurb: 'From finding someone to having a confirmed time.',
      topics: [
        {
          id: 'find',
          title: 'Find an artist',
          summary: 'Search, or browse by what you are looking for.',
          steps: [
            'On the home screen, use **Search by artist, service, or city…** to look for someone by name, by the service you want, or by where you are.',
            'Or tap a category - **MAKEUP**, **HAIR**, **NAILS**, **LASHES** - to browse.',
            'Tap an artist to see their work, their services and their prices.',
          ],
          notes: [
            'A green dot next to an artist means they are open right now.',
          ],
        },
        {
          id: 'book',
          title: 'Book an appointment',
          summary: 'Pick a service, pick a time, leave your details.',
          steps: [
            'Open the artist\'s page and choose the service you want.',
            'If the artist works from more than one place, **Select location**.',
            'Choose a **Date**, then pick a time. Times are grouped into **Morning** and **Afternoon**.',
            'Enter **Your name** and **Phone number**.',
            'Check the summary - service, date, time, location and total - then confirm.',
            'You will see **Booking request sent!**',
          ],
          notes: [
            'A booking is a request, not a confirmed appointment. The artist reviews it and confirms.',
            'You will receive confirmation on WhatsApp.',
            'You do not need an account to book. Your phone number is how the artist reaches you.',
            'Only times the artist is genuinely free are offered, so anything you can pick is really available.',
          ],
        },
        {
          id: 'promo',
          title: 'Use a promo code',
          summary: 'If an artist gave you a code, enter it before you confirm.',
          steps: [
            'Enter the code on the summary step, before confirming.',
            'The discount is applied and shown in the breakdown, so you can see the original price, the discount and what you will actually pay.',
          ],
          notes: [
            'One code per booking.',
            'Some codes are only for clients booking with that artist for the first time.',
          ],
        },
        {
          id: 'deposit',
          title: 'Pay your deposit',
          summary: 'Some artists ask for a deposit before confirming.',
          steps: [
            'If the service needs a deposit, the amount is shown before you confirm.',
            'Send it to the artist by OMT or Whish.',
            'The artist records it and confirms your appointment.',
          ],
          notes: [
            'The deposit goes directly to the artist. B-Edge never holds your money.',
            'Services marked **No deposit required** need nothing up front.',
          ],
        },
        {
          id: 'waitlist',
          title: 'Join the waitlist when a day is full',
          summary: 'Get offered the slot if someone cancels.',
          steps: [
            'If there is nothing free on the day you want, choose **Join the waitlist**.',
            'If a slot opens up, you are offered it and have a limited time to confirm before it passes to the next person.',
          ],
        },
      ],
    },
    {
      id: 'manage',
      title: 'Managing your bookings',
      blurb: 'After you have booked.',
      topics: [
        {
          id: 'signin',
          title: 'Sign in',
          summary: 'Your phone number and a code. No password.',
          steps: [
            'Choose **Sign in**.',
            'Enter your **Phone number** and choose **Send code**.',
            'Enter the 6-digit code you receive, then **Verify**.',
          ],
          notes: [
            'You only need to sign in to see your past and upcoming bookings. Booking itself does not require it.',
          ],
        },
        {
          id: 'view',
          title: 'See your bookings',
          summary: 'Upcoming and past, in one place.',
          steps: [
            'Go to **My Bookings**.',
            'Switch between upcoming and past appointments using the tabs.',
            'Tap any booking to see the service, **Date & time**, **Location**, **Price** and **Deposit**.',
          ],
        },
        {
          id: 'cancel',
          title: 'Cancel a booking',
          summary: 'And what happens to your deposit.',
          steps: [
            'Open the booking from **My Bookings**.',
            'Choose **Cancel booking**.',
            'Confirm on **Cancel this booking?**, or choose **Keep my booking** to go back.',
          ],
          notes: [
            'Cancelling less than 24 hours before your appointment means your deposit is not returned. The screen tells you clearly before you confirm.',
            'Cancel earlier than that and the artist returns your deposit directly.',
          ],
        },
        {
          id: 'review',
          title: 'Leave a review',
          summary: 'After your visit, using the link you are sent.',
          steps: [
            'Open the review link sent to you after your appointment.',
            'Rate the artist.',
            'Rate the salon under **And the salon?**',
            'Optionally **Write a comment**.',
            'Submit. You will see **Review submitted**.',
          ],
          notes: [
            'The two ratings are separate on purpose - the work and the place are different things.',
            'The link works once, and only for people who actually had an appointment.',
          ],
        },
      ],
    },
    {
      id: 'safety',
      title: 'Staying safe',
      blurb: 'Money moves directly between you and the artist, so these are worth knowing.',
      topics: [
        {
          id: 'deposit-safety',
          title: 'Protecting yourself when you send a deposit',
          summary: 'There is no card in the middle, so the record you keep is your protection.',
          steps: [
            'Send only to the payment details shown in the app on your confirmation screen. Never to a number someone sends you in a message.',
            'Check the account name shown in the app matches the name your OMT or Whish app shows before you confirm the transfer.',
            'Send only the deposit amount shown. Never more, and never anything else before your appointment - the rest is paid in person.',
            'Keep the OMT or Whish reference. It is the only proof that links your money to your booking.',
            'Check your booking afterwards. Once the artist records your deposit, it shows on the booking in **My Bookings**.',
            'If the artist has not recorded it after a day, message them and quote your reference.',
          ],
          notes: [
            'B-Edge never holds your money and never asks for it. The deposit goes straight from you to the artist, so there is no card company to reverse it - which is exactly why the details shown in the app, the reference and the record on your booking all matter.',
            'If an artist has not set their payment details, the app says so and they will send them to you directly. In that case there is nothing to check against, so be especially careful that you are talking to the right person.',
            'A deposit can never be more than the price of the service. If you are ever asked for more than the app shows, something is wrong.',
            'Nobody at B-Edge will ever ask you for a password, a card number or a one-time code. The only code we send is the 6-digit one you asked for when signing in.',
          ],
        },
        {
          id: 'trust-signals',
          title: 'Knowing an artist is real',
          summary: 'What the app checks, and what you should check yourself.',
          steps: [
            'Every artist is reviewed by the B-Edge team before they can take a single booking.',
            'Look for the **Verified** badge. It means B-Edge has seen documents confirming that artist\'s identity and that their business is real.',
            'Read the reviews. They can only be left by someone who actually had an appointment, through a private link sent afterwards - so they cannot be bought or faked.',
            'Look at the portfolio. A real one has variety: different clients, angles and lighting, built up over time.',
            'Check the location and the hours are ones a real business would keep.',
          ],
          notes: [
            'The **Verified** badge is about identity, not quality. It says we know who they are - it does not say their work is good. The reviews tell you that, and they can only be left by people who actually attended.',
            'Be wary of anyone pressing you to decide immediately, or offering a price far below everyone else. Urgency and an unbeatable price are the two oldest tools there are.',
          ],
        },
        {
          id: 'stay-on-platform',
          title: 'Why booking through the app protects you',
          summary: 'An off-app booking has no record at all.',
          steps: [
            'Book and pay your deposit against a booking that exists in the app.',
            'If someone asks you to book outside B-Edge, or to send a deposit for an appointment that is not in your **My Bookings**, treat that as a warning sign.',
          ],
          notes: [
            'A booking made in the app has a record: what you agreed, what it cost, what deposit was asked for and whether it was confirmed. A booking arranged privately has none of that, and neither you nor the artist can point to anything afterwards.',
          ],
        },
      ],
    },
    {
      id: 'shop',
      title: 'Buying products',
      blurb: 'Some artists sell products as well as appointments.',
      topics: [
        {
          id: 'order',
          title: 'Order a product',
          summary: 'Add to cart, leave a delivery address, pay by transfer.',
          steps: [
            'Open the artist\'s shop and tap a product.',
            'Add it to your cart.',
            'In the cart, enter **Full name** and **Phone number**.',
            'Set your **Delivery location**.',
            'Check the **Total** and place your order.',
            'Send payment by OMT or Whish. The artist confirms once it arrives.',
          ],
          notes: [
            'Your cart survives closing the app, but prices are always rechecked against the artist\'s current ones before you order.',
          ],
        },
      ],
    },
    {
      id: 'app',
      title: 'The app itself',
      blurb: 'Small things worth knowing.',
      topics: [
        {
          id: 'theme',
          title: 'Switch between light and dark',
          summary: 'Or let it follow your phone.',
          steps: [
            'Go to **My Bookings**.',
            'Use the theme control in the header to choose light, dark, or system.',
          ],
          notes: [
            'System follows your phone\'s own setting, including switching automatically at night. This is the default.',
            'Your choice is saved on this device only.',
          ],
        },
        {
          id: 'install',
          title: 'Add B-Edge to your home screen',
          summary: 'Opens like an app, no browser tabs.',
          steps: [
            'When the prompt appears, choose to install.',
            'On iPhone, you can also use Share, then Add to Home Screen.',
          ],
        },
      ],
    },
  ],
};
