import { Node } from "./Node";

export class LinkedList<T> {
  head: Node<T> | null = null;
  size: number = 0;
  
  initialize(data: T): void {
    this.head = new Node<T>(data);
  }

  append(data: T): void {
    if (this.size === 0) this.initialize(data);
    else {
      let current = this.head!;
      while (current.next) current = current.next;
      current.next = new Node<T>(data);
    }
    this.size++;
  }

  lasted(): Node<T> | undefined {
    if (this.size === 0) return;
    else {
      let current = this.head;
      while (current?.next) {
        current = current.next;
      }
      return current!;
    }
  }
}