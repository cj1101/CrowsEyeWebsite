Hello Codex,

I need your help to perform a comprehensive cleanup and bug-fixing pass on my project. The goal is to resolve as many static errors, type issues, and linting violations as possible, and to refactor repetitive code without altering the core business logic.

Please follow this structured process carefully.

### **Project Context:**
*   **Framework:** Next.js 14+ (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **Authentication:** Firebase (Client-side and Admin SDK for server-side)
*   **Key Libraries:** Shadcn/UI, Stripe

---

### **Phase 1: Discovery & Analysis**

Your first step is to get a complete picture of the project's health.

1.  **Dependency Check:** Run `npm install` to ensure all dependencies are correctly installed and there are no version conflicts.
2.  **Build Analysis:** Run the production build command: `npm run build`. This is the most critical step. It will fail if there are serious type errors or other build-blocking issues. Capture all errors and warnings from the output.
3.  **Type Checking:** Run a standalone type check: `tsc --noEmit`. This will provide a comprehensive list of all TypeScript-related errors throughout the project, even those that might not block a build.
4.  **Linting:** Run the linter to find code style and quality issues: `npm run lint` (or `npx eslint .` if a script doesn't exist). Capture all reported problems.

### **Phase 2: Planning & Prioritization**

Once you have the full list of issues, do not start fixing immediately. First, create a prioritized plan.

1.  **Categorize Issues:** Group the problems into the following categories:
    *   **Build-Breaking Errors:** Highest priority. The application cannot be deployed with these.
    *   **TypeScript Errors:** High priority. These are potential runtime bugs.
    *   **Linting Errors (e.g., `error` level):** Medium priority. These are often code quality issues that can lead to bugs.
    *   **Code Repetition (DRY violations):** Medium priority. Identify chunks of code (components, functions, logic) that are copied in multiple places.
    *   **Linting Warnings (e.g., `warn` level):** Low priority. These are typically stylistic or minor issues.

2.  **Propose a Plan:** Present a summary of your findings and a high-level plan. For example:
    > "I've analyzed the project and found:
    > *   5 build-breaking errors in the billing and API routes.
    > *   25 TypeScript errors, mostly related to incorrect prop types in components.
    > *   Significant code repetition in the dashboard pages, where 3 different components share the same data-fetching logic.
    > *   40 linting warnings, mostly about unused variables.
    >
    > My plan is to:
    > 1.  First, fix the 5 build-breaking errors.
    > 2.  Then, address the 25 TypeScript errors, starting with the most common ones.
    > 3.  Next, refactor the repetitive data-fetching logic into a single reusable hook or utility function.
    > 4.  Finally, clean up the linting warnings."

### **Phase 3: Execution (Iterative Fixing)**

Once I approve the plan, begin fixing the issues iteratively.

*   **One Thing at a Time:** Fix one file or one category of error at a time. This makes changes easier to review and verify.
*   **Verify After Each Fix:** After each significant change, re-run the relevant command (`npm run build`, `tsc --noEmit`, or `npm run lint`) to ensure your fix was successful and did not introduce any new problems.
*   **Adhere to Conventions:** Strictly follow the existing coding style, naming conventions, and architectural patterns in the project.
*   **Refactor for Reusability:** When addressing code repetition, create reusable components (for UI), hooks (for React logic), or utility functions (for generic logic). Place new shared files in the appropriate directory (e.g., `src/components`, `src/hooks`, `src/lib`, `src/utils`).
*   **Do Not Change Logic:** Your primary goal is to fix errors and refactor, not to change functionality. Do not alter business logic unless it is the direct cause of a bug.

### **Example Workflow:**

1.  **You:** "I will now fix the type error in `src/app/dashboard/page.tsx` where the `user` prop is missing a type definition."
2.  *(You perform the fix using the available tools)*
3.  **You:** "The fix is applied. I am now running `tsc --noEmit` to verify."
4.  *(You run the verification command)*
5.  **You:** "Verification passed. The error is resolved. I will now address the next issue."

Please begin with Phase 1. Let me know if you have any questions.
