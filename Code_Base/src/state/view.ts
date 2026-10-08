/* Which of the two views this window is (brief §6.1).
   console : the salesperson's laptop or tablet (default)
   buyer   : the TV in the experience centre; open with ?view=buyer
   Until presenter-mode sync is built, both run the same session in one window. */
export type View = 'console' | 'buyer';
export const VIEW: View = new URLSearchParams(window.location.search).get('view') === 'buyer' ? 'buyer' : 'console';
