export class Room {
  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number
  ) {}
}

export class BspNode {
  public leftChild?: BspNode;
  public rightChild?: BspNode;
  public room?: Room;

  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number
  ) {}

  public isLeaf(): boolean {
    return !this.leftChild && !this.rightChild;
  }
}
