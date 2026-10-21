/** Who may see the Flow test page (developer tool). Compared with the signed-in user's email, ignoring letter case.
 *  Note: this only hides the page in the app; it is not a security boundary. */
export const FLOW_TEST_USER = 'krishnakumar.saravan@dewa.gov.ae'
export const canUseFlowTest = (email?: string | null) => !!email && email.trim().toLowerCase() === FLOW_TEST_USER
