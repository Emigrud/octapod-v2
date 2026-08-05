# Switch to an external Supabase backend

## Goal
Keep the app on Lovable for building/hosting, but replace the managed Lovable Cloud backend with your own external Supabase project.

## What will happen

1. **Disconnect Lovable Cloud**
   - A workspace admin goes to **Cloud → Advanced → Disconnect**.
   - This is irreversible and permanently deletes all Lovable Cloud data for this project (database, auth users, storage, functions). Do not disconnect until you have exported anything you want to keep.

2. **Connect your own Supabase project**
   - In Lovable, go to the **Connectors** area and choose **Supabase** (or **Lovable Cloud → Bring your own Supabase**, depending on the current UI label).
   - Enter your external Supabase project URL and public key.

3. **Update environment variables / secrets**
   - The generated Supabase integration files (`client.ts`, `client.server.ts`, `auth-middleware.ts`, `auth-attacher.ts`) are designed to work with any Supabase project once the variables are correct.
   - After connecting, the project variables will be updated to point at your Supabase instance. If any are missing, I will set them so the app builds and the auth middleware can attach bearer tokens.

4. **Verify the swap**
   - Rebuild the app and confirm the dev server starts without missing-variable errors.
   - Check that the app can reach your Supabase Auth (e.g. sign-in page or a public health read).

## What I need from you

Before I start, confirm:

- You have your Supabase project URL and public (anon) key ready.
- You are a workspace admin, or you can ask one to perform the Lovable Cloud disconnect step.
- You understand that disconnecting Lovable Cloud will delete the existing backend data and cannot be undone.

Once you confirm, I will begin with the disconnect/reconnect steps and update the project configuration.