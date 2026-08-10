Root desktop app structure: fixed Sidebar + fluid main column (TopBar + max-width ~1180px content). Start every ATLAS Web screen from this.

```jsx
<AppShell sidebar={<Sidebar activeItem="Inicio"/>} topBar={<TopBar brand="General"/>}>...</AppShell>
```
