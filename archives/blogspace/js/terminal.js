document.addEventListener("DOMContentLoaded", init);

let root = null;
let currentDir = null;
let pathStack = [];

async function init() {
    const input = document.getElementById("terminal-input");
    const output = document.getElementById("terminal-output");

    await loadRoot();

    input.disabled = true;

    await bootSequence(output);

    input.disabled = false;
    input.focus();

    input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            const command = input.value.trim();
            printLine(`${getPrompt()}$ ${command}`);
            handleCommand(command);
            input.value = "";
        }
    });

    // ---------------------------
    // Utility Functions
    // ---------------------------

    function delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    function randomDelay(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function printLine(text, style = "") {
        const line = document.createElement("div");

        if (style) {
            const span = document.createElement("span");
            span.textContent = text.replace("%c", ""); // remove placeholder
            span.style = style;
            line.appendChild(span);
        } else {
            line.textContent = text;
        }

        output.appendChild(line);
        output.scrollTop = output.scrollHeight;
    }

    function getPrompt() {
        const path = pathStack.length > 0 ? pathStack.map((dir) => dir.name).join("/") : "";
        return `velosophy@blogspace:/${path}`;
    }

    // ---------------------------
    // Command Handling
    // ---------------------------

    function handleCommand(command) {
        const [cmd, arg] = command.split(" ");
        const indent = "    ";

        switch (cmd) {
            case "help":
                [
                    "Available commands:",
                    "help        - show commands",
                    "about       - information",
                    "ls          - list directory contents",
                    "ls -r       - recursive list",
                    "cd <folder> - change directory",
                    "cd ..       - go up one directory",
                    "clear       - clear terminal"
                ].forEach((line) => printLine(indent + line));
                break;

            case "about":
                ["Welcome to the velosophy 'Blogspace' terminal", "This is Blogspace 1.0.0"].forEach((line) =>
                    printLine(indent + line)
                );
                break;

            case "ls":
                if (arg === "-r") {
                    listDirectoryRecursive();
                } else {
                    listDirectory();
                }
                break;

            case "cd":
                changeDirectory(arg);
                break;

            case "clear":
                output.innerHTML = "";
                break;

            case "":
                break;

            default:
                printLine(`command not found: ${command}`);
        }
    }

    // ---------------------------
    // Directory Listing
    // ---------------------------

    // Current folder only
    function listDirectory() {
        if (!currentDir.children || currentDir.children.length === 0) {
            printLine("(empty)");
            return;
        }

        currentDir.children.forEach((item) => {
            if (item.type === "folder") {
                printLine("%c├── " + item.name, "color: #4FC1FF; font-weight: bold"); // blue for folders
            } else {
                printLine("%c├── " + item.name, "color: #FFB74D"); // orange for files
            }
        });
    }

    // Recursive listing
    function listDirectoryRecursive(dir = currentDir, depth = 0) {
        if (!dir.children || dir.children.length === 0) {
            printLine("    ".repeat(depth) + "(empty)");
            return;
        }

        const indent = "    ".repeat(depth);

        dir.children.forEach((item) => {
            if (item.type === "folder") {
                printLine(indent + "%c├── " + item.name, "color: #4FC1FF; font-weight: bold");
                listDirectoryRecursive(item, depth + 1);
            } else {
                printLine(indent + "%c├── " + item.name, "color: #FFB74D");
            }
        });
    }

    // ---------------------------
    // Change Directory
    // ---------------------------

    function changeDirectory(folderName) {
        if (!folderName) {
            printLine("cd: missing operand");
            return;
        }

        if (folderName === "..") {
            if (pathStack.length === 0) {
                printLine("Already at root.");
                return;
            }
            currentDir = pathStack.pop();
            return;
        }

        if (!currentDir.children) {
            printLine(`cd: no such directory: ${folderName}`);
            return;
        }

        const target = currentDir.children.find((item) => item.type === "folder" && item.name === folderName);

        if (!target) {
            printLine(`cd: no such directory: ${folderName}`);
            return;
        }

        pathStack.push(currentDir);
        currentDir = target;
    }

    // ---------------------------
    // Boot Sequence
    // ---------------------------

    async function bootSequence(output) {
        const lines = [
            { text: 'Booting Blogspace OS v1.0.0 ...', delay: 500 },
            { text: "Loading kernel modules...", delay: 800 },
            { text: "Mounting /blogspace...", delay: 300 },
            { text: "Initializing virtual filesystem...", delay: 1000 },
            { text: "Starting terminal service...", delay: 400 },
            { text: "Done.", delay: 200 },
            { text: "", delay: 100 },
            { text: "Welcome to Blogspace Terminal.", delay: 300 },
            { text: "Type 'help' to see commands.", delay: 300 },
            { text: "", delay: 100 }
        ];

        for (const line of lines) {
            await delay(line.delay || randomDelay(200, 600));
            printLine(line.text);
        }
    }
}

// ---------------------------
// Load root.json
// ---------------------------

async function loadRoot() {
    try {
        const response = await fetch("data/root.json");
        if (!response.ok) throw new Error("Failed to load root.json");

        root = await response.json();
        currentDir = root;
    } catch (err) {
        console.error(err);
    }
}
