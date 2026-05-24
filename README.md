## 👋 What is this??
weekTasks was born out of pure necessity for my part. Between assignments, project deadlines, and everything else life throws at you, it's easy to lose track of what still needs to get done. Instead of scattered sticky notes and forgotten to-do lists, this is a clean, distraction-free space to lay out your week, tick things off, and actually *see* yourself making progress.Highly inspired by the kanban methodology.

It lives in your browser. No sign-up. No account. Just open it and go.

---

## ✨ Features

- **Progress bar** — sits at the top of the page and updates live as you move tasks to Done. You can see your week at a glance as a percentage
- **Two-column board** — a *To Do* column and a *Done* column. Simple as that
- **Drag & drop** — grab any task and drop it into the other column. Hold it as long as you want, it won't slip
- **Add & delete tasks** — type a task and hit Add (or press Enter). Remove tasks with the ✕ button
- **Weekly reset** — every new week the board automatically clears itself so you start fresh. No manual cleanup needed
- **Persistent storage** — closing your tab or your browser does not delete your tasks. They are saved in your browser's localStorage and will be there when you come back
- **No internet required** — once the fonts load on first open, the site works completely offline

---

## 🚀 Getting Started

You only need three files in the same folder:

```
weekTasks/
├── index.html
├── style.css
└── main.js
```

**Option 1 — Live Server (recommended for development)**
1. Open the folder in VS Code
2. Install the Live Server extension if you haven't already
3. Right-click `index.html` → *Open with Live Server*

**Option 2 — Just open the file**
Double-click `index.html` and it opens straight in your browser. That's it.

---

## 🗂️ How to use it

1. Type your task into the input field at the top of the board
2. Press **Enter** or click **+ Add**
3. Your task appears in the *To Do* column with a bullet point
4. When you finish a task, **drag it** over to the *Done* column and drop it
5. Watch the progress bar fill up
6. At the start of a new week, everything resets automatically

---

## 💾 Where is my data stored?

Your tasks are saved in your browser's **localStorage** — a small storage area built into every browser, written to your computer's disk. This means:

| Situation | Tasks safe? |
|---|---|
| Closed the tab | ✅ Yes |
| Closed the browser | ✅ Yes |
| Restarted the computer | ✅ Yes |
| Cleared browser data / cache | ❌ No |
| Opened in incognito / private mode | ❌ No (wiped on close) |
| Switched to a different browser | ❌ No (separate storage) |
| Opened on a different device | ❌ No (local only) |

> ⚠️ **Heads up** — tasks are permanently deleted at the start of each new week. Make sure you complete everything before then!

---

## 🛠️ Built with

- Plain HTML, CSS, and JavaScript — no frameworks, no dependencies
- Pointer Events API for the drag and drop (works on mouse and touch)
- Browser localStorage for data persistence
- Google Fonts (Bebas Neue + DM Sans)

---

## 📁 File breakdown

| File | What it does |
|---|---|
| `index.html` | The structure and layout of the page |
| `style.css` | All the visual styling, colours, and animations |
| `main.js` | All the logic — tasks, drag & drop, weekly reset, storage |

---

Thx for trying it out!!
