import { RuntimeError } from "typing/typing";


export class Node<T> {
    #data: T;
    #prev: Node<T> | null;
    #next: Node<T> | null;
    
    constructor(data: T) {
        this.#data = data;
        this.#prev = null;
        this.#next = null;
    }

    get_data() {
        return this.#data;
    }

    get_prev() {
        return this.#prev;
    }
    
    set_prev(node: Node<T> | null) {
        this.#prev = node;
    }

    get_next() {
        return this.#next;
    }
    
    set_next(node: Node<T> | null) {
        this.#next = node;
    }
}

export class Linklist<T> {
    #head: Node<T> | null;
    #tail: Node<T> | null;
    #length: number;

    constructor() {
        this.#head = null;
        this.#tail = null;
        this.#length = 0;
    }

    length(): number {
        return this.#length;
    }

    push(data: T) {
        const newNode = new Node(data);

        if(this.#head === null && this.#tail === null) {
            this.#head = newNode;
            this.#tail = newNode;
            this.#length++;
            return;
        }

        this.#tail?.set_next(newNode);
        newNode.set_prev(this.#tail!);
        this.#tail = newNode;
        this.#length++;
    }
    
    push_ahead(data: T) {
        const newNode = new Node(data);
    
        if(this.#head === null && this.#tail === null) {
            this.#head = newNode;
            this.#tail = newNode;
            this.#length++;
            return;
        }
        
        this.#head?.set_prev(newNode);
        newNode.set_next(this.#head!);
        this.#head = newNode;
        this.#length++;
    }
    
    pop(): T {
        if(this.#length === 0) {

            throw new RuntimeError("Linklist Error: Not engough nodes to pop.");

        } else if(this.#length === 1) {
            const data = this.#tail!.get_data();
            this.#head = null;
            this.#tail = null;
            this.#length--;
            return data;
        }

        const data = this.#tail!.get_data();
        this.#tail?.get_prev()!.set_next(null);
        this.#tail = this.#tail!.get_prev();
        this.#length--;

        return data;
    }
    
    pop_head() {
        if(this.#length === 0) {

            throw new RuntimeError("Linklist Error: Not engough nodes to pop.");

        } else if(this.#length === 1) {
            const data = this.#head!.get_data();
            this.#head = null;
            this.#tail = null;
            this.#length--;
            return data;
        }

        const data = this.#head!.get_data();
        this.#head = this.#head!.get_next();
        this.#length--;
        return data;
    }

    pop_by_index(index: number) {
        if(index > this.#length) {
            throw new RuntimeError("Linklist Error: index access out of bound.");
        }
        let counter = 0;
        let traversor = this.#head;
    
        while(counter !== index) {
            traversor = traversor!.get_next();
        }

        return traversor!.get_data();
    }

    pop_by_value(data: T): T | null {
        if(this.#length === 0) {

            throw new RuntimeError("Linklist Error: Not engough nodes to pop.");

        } else if(this.#length === 1) {
            const lData = this.#head!.get_data();
            if(lData !== data) return null;

            this.#head = null;
            this.#tail = null;
            this.#length--;
            return data;
        }

        let traversor = this.#head;
    
        while(traversor !== null) {
            if(traversor.get_data() === data) return data;
            traversor = traversor!.get_next();
        }

        return null;
    }

    has(data: T): T | null {
        let traversor = this.#head;

        while(traversor !== null) {
            if(traversor.get_data() === data) return data;
            traversor = traversor.get_next();
        }

        return null;
    }
    
    serialize(): string {
        const array: Array<T> = [];
        let traversor = this.#head;
    
        while(traversor !== null) {
            const data = traversor.get_data();
            array.push(data);
            traversor = traversor.get_next();
        }
    
        return JSON.stringify(array);
    }

    deserialize(serializedObj: string) {
        const array = JSON.parse(serializedObj);

        for(const value of array) {
            this.push(value);
        }
    }
}