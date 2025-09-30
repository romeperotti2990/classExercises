class Node {
    constructor(value) {
        this.value = value;
        this.next = null;
        this.prev = null;
    }
}

class DoublyLinkedList {
    constructor() {
        this.head = null;
        this.tail = null;
        this.length = 0;
    }

    append(value) {
        const newNode = new Node(value);
        if (!this.head) {
            this.head = this.tail = newNode;
        } else {
            this.tail.next = newNode;
            newNode.prev = this.tail;
            this.tail = newNode;
        }
        this.length++;
        return this;
    }

    prepend(value) {
        const newNode = new Node(value);
        if (!this.head) {
            this.head = this.tail = newNode;
        } else {
            newNode.next = this.head;
            this.head.prev = newNode;
            this.head = newNode;
        }
        this.length++;
        return this;
    }

    remove(value) {
        let current = this.head;
        while (current) {
            if (current.value === value) {
                if (current.prev) current.prev.next = current.next;
                else this.head = current.next;
                if (current.next) current.next.prev = current.prev;
                else this.tail = current.prev;
                this.length--;
                return true;
            }
            current = current.next;
        }
        return false;
    }

    find(value) {
        let current = this.head;
        while (current) {
            if (current.value === value) return current;
            current = current.next;
        }
        return null;
    }

    toArray() {
        const arr = [];
        let current = this.head;
        while (current) {
            arr.push(current.value);
            current = current.next;
        }
        return arr;
    }
}

let playlist = new DoublyLinkedList();
let currentSongNode = null;

// Example: Add some songs for demo
playlist.append("Song 1");
playlist.append("Song 2");
playlist.append("Song 3");
currentSongNode = playlist.head;

function updateDisplay() {
    const songDisplay = document.getElementById('current');
    songDisplay.innerHTML = `Currently playing: ${currentSongNode ? currentSongNode.value : 'No songs in playlist'}`;
}

document.getElementById('play').addEventListener('click', () => {
    const newSong = prompt("Enter song name:");
    if (newSong) {
        playlist.prepend(newSong);
        currentSongNode = playlist.head;
        updateDisplay();
    }
});

document.getElementById('add').addEventListener('click', () => {
    const newSong = prompt("Enter song name:");
    playlist.append(newSong);
    updateDisplay();
});

document.getElementById('remove').addEventListener('click', () => {
    if (currentSongNode) {
        const songToRemove = currentSongNode.value;
        playlist.remove(songToRemove);
        currentSongNode = currentSongNode.next || currentSongNode.prev;
        updateDisplay();
    }
});

document.getElementById('next').addEventListener('click', () => {
    if (currentSongNode && currentSongNode.next) {
        currentSongNode = currentSongNode.next;
        updateDisplay();
    }
});

document.getElementById('back').addEventListener('click', () => {
    if (currentSongNode && currentSongNode.prev) {
        currentSongNode = currentSongNode.prev;
        updateDisplay();
    }
});


// Initial display
updateDisplay();