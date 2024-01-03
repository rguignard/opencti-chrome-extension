export default function getPageContent() {
    let innerText = document.documentElement.innerText;
    return refangText(innerText)
}

function refangText(text: string) {
    text = text.replaceAll('[.]', '.')
        .replaceAll('hxxp', 'http')
        .replaceAll('(.)', '.')
        .replaceAll('[:]', ':')
        .replaceAll('(dot)', '.')
        .replaceAll('[dot]', '.');
    return text
}
