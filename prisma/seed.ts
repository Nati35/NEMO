import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting seed...')

    // 1. Create a User
    const user = await prisma.user.upsert({
        where: { email: 'student@example.com' },
        update: {},
        create: {
            email: 'student@example.com',
            name: 'Netanel',
            isPro: true,
            points: 1250,
            streakDays: 5,
        },
    })

    console.log(`👤 Created user: ${user.name}`)

    // 2. Create Deck: English Vocabulary
    const englishDeck = await prisma.deck.create({
        data: {
            title: 'English Vocabulary',
            description: 'Essential words for academic success',
            userId: user.id,
            cards: {
                create: [
                    { front: 'Ephemeral', back: 'Lasting for a very short time' },
                    { front: 'Serendipity', back: 'The occurrence of events by chance in a happy or beneficial way' },
                    { front: 'Eloquent', back: 'Fluent or persuasive in speaking or writing' },
                    { front: 'Resilient', back: 'Able to withstand or recover quickly from difficult conditions' },
                ]
            }
        }
    })

    console.log(`📚 Created deck: ${englishDeck.title}`)

    // 3. Create Deck: React & Next.js
    const reactDeck = await prisma.deck.create({
        data: {
            title: 'React & Next.js Mastery',
            description: 'Core concepts for frontend development',
            userId: user.id,
            cards: {
                create: [
                    { front: 'useEffect', back: 'A hook that lets you synchronize a component with an external system.' },
                    { front: 'Server Components', back: 'Components that render on the server and reduce the amount of JavaScript sent to the client.' },
                    { front: 'Hydration', back: 'The process of attaching event listeners to the HTML rendered by the server.' },
                ]
            }
        }
    })

    console.log(`📚 Created deck: ${reactDeck.title}`)

    console.log('✅ Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
