import type { Guide } from '@bedge/shared';

/**
 * The platform administrator's guide.
 *
 * Shipped in the artist dashboard, because that is where the /admin screen
 * lives, and shown only to signed-in admins - the tasks here decide whether
 * an artist can trade, and describing them to every artist would be an
 * invitation to ask for them.
 */
export const ADMIN_GUIDE: Guide = {
  id: 'admin',
  title: 'Admin guide',
  intro:
    'Running the platform: approving artists, confirming subscription payments, '
    + 'and managing plans. All of it lives under **Admin**.',
  sections: [
    {
      id: 'approvals',
      title: 'Artist applications',
      blurb: 'Who gets to trade on B-Edge.',
      topics: [
        {
          id: 'approve',
          title: 'Approve or reject an application',
          summary: 'New artists cannot take bookings until you approve them.',
          steps: [
            'Go to **Admin** and open the **Approvals** tab.',
            'Open an application to see the **Business**, **Handle**, **Category**, **Location** and **First service** the artist entered.',
            'Check the handle: it becomes a public web address, so it should be recognisable and not impersonate anyone.',
            'Choose **Approve** to let them trade, or **Confirm reject** to decline.',
          ],
          notes: [
            '**Nothing waiting on you** means the queue is empty.',
            'Approving starts the artist\'s trial. Their public page goes live immediately.',
            'A rejected artist sees the reason and can correct their details and apply again, so write something they can act on.',
          ],
        },
      ],
    },
    {
      id: 'billing',
      title: 'Subscription payments',
      blurb: 'Artists transfer by OMT or Whish and tell you. You confirm.',
      topics: [
        {
          id: 'confirm-paid',
          title: 'Confirm a subscription payment',
          summary: 'An artist says they have paid; you check and confirm.',
          steps: [
            'Go to **Admin** and open the **Billing** tab. Invoices waiting on you appear under **Needs confirmation**.',
            'Note the artist, the amount **Outstanding** and the reference they submitted.',
            'Check the B-Edge OMT or Whish account for a matching transfer.',
            'Choose **Confirm paid** if it is there.',
            'If the payment never arrives or was submitted in error, choose **Confirm void** instead.',
          ],
          notes: [
            'Confirming is what restores an artist whose account had gone past due, so it is worth doing promptly - an unconfirmed payment leaves a paying artist hidden from search.',
            'Confirming records who confirmed it and when. Do not confirm on the artist\'s word alone; check the account.',
          ],
        },
      ],
    },
    {
      id: 'plans',
      title: 'Plans',
      blurb: 'What artists can subscribe to.',
      topics: [
        {
          id: 'create-plan',
          title: 'Create or edit a plan',
          summary: 'Name, price and how many artists it covers.',
          steps: [
            'Go to **Admin** and open the **Plans** tab.',
            'Choose **New plan**, or **Edit** an existing one.',
            'Enter the **Name**, a **Description**, and the **Code** used internally.',
            'Set the price and the **Included seats** - how many artists the plan covers.',
            'Save.',
          ],
          notes: [
            'All prices are in US dollars.',
            'Mark a plan **Hidden** to stop new artists choosing it without affecting anyone already on it.',
            'Changing a price does not change what existing subscribers are billed for periods already invoiced.',
          ],
        },
      ],
    },
    {
      id: 'artists',
      title: 'Artists',
      blurb: 'Managing accounts after approval.',
      topics: [
        {
          id: 'manage-artists',
          title: 'Find and manage an artist',
          summary: 'Look someone up, change their details, or suspend them.',
          steps: [
            'Go to **Admin** and open the **All artists** tab.',
            'Find the artist and choose **Edit**.',
            'Change what you need and save.',
            'Use **Reinstate** to restore an account that was suspended.',
          ],
          notes: [
            'Suspending removes an artist from search and stops new bookings. It does not delete their history, and it is reversible.',
            'Handles are public addresses. Changing one breaks every link already shared, so only do it on request and tell the artist.',
          ],
        },
      ],
    },
  ],
};
