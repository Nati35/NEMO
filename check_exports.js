try {
    const TextStyle = require('@tiptap/extension-text-style');
    console.log('TextStyle:', Object.keys(TextStyle));

    const Color = require('@tiptap/extension-color');
    console.log('Color:', Object.keys(Color));

    const Underline = require('@tiptap/extension-underline');
    console.log('Underline:', Object.keys(Underline));

    const Link = require('@tiptap/extension-link');
    console.log('Link:', Object.keys(Link));

    const Image = require('@tiptap/extension-image');
    console.log('Image:', Object.keys(Image));

    const Placeholder = require('@tiptap/extension-placeholder');
    console.log('Placeholder:', Object.keys(Placeholder));
} catch (e) {
    console.error(e);
}
