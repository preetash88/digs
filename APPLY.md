# Digs redesign — how to apply

1. In your project folder, commit what you have first so you can undo this:
       git add -A; git commit -m "before redesign"
2. Copy digs-redesign.zip into the project folder, then in PowerShell:
       Expand-Archive -Path .\digs-redesign.zip -DestinationPath . -Force
3. This zip fixes the users table (adds phone_verified), so rebuild the dev database:
       Remove-Item data\digs.db
       npm run db:push
       npm run db:seed
4. Start it:
       npm run dev

Real photos: the hero is painted SVG. To use photography, see src/components/Landscape.tsx.
