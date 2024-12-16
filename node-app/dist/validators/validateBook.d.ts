interface BookData {
    title: string;
    publicationYear: number;
    genre: string;
    author: {
        id: number;
    };
}
export declare function validateBook(book: BookData): string[];
export {};
