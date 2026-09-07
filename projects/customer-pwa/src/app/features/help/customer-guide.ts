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
