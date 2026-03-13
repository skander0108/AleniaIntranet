import { OrgNode } from '../../core/models/org-chart.model';

export const ORG_CHART_DATA: OrgNode = {
    id: 'cd-1',
    fullName: 'Myriam Aïssaoui',
    title: 'Country Director',
    department: 'Direction',
    avatarUrl: '',
    statusColor: 'green',
    reportsCount: 8,
    children: [
        // --- Global Head of HR & Finance (lateral) ---
        {
            id: 'hr-global-1',
            fullName: 'Lyla Zamoun',
            title: 'Global Head of HR & Finance',
            department: 'HR & Finance',
            avatarUrl: '',
            statusColor: 'green',
            reportsCount: 2,
            children: [
                {
                    id: 'hr-ast-1',
                    fullName: 'Natali Marrachinho',
                    title: 'HR Assistant',
                    department: 'HR Department',
                    avatarUrl: '',
                    statusColor: 'green',
                    reportsCount: 0,
                    children: []
                },
                {
                    id: 'biz-dev-1',
                    fullName: 'TBD',
                    title: 'Client Leader / Business Developer',
                    department: 'Business Development',
                    avatarUrl: '',
                    statusColor: 'gray',
                    reportsCount: 0,
                    children: []
                }
            ]
        },
        // --- Michel Barnabot - Talent Manager ---
        {
            id: 'tm-michel',
            fullName: 'Michel Barnabot',
            title: 'Talent Manager',
            department: 'Talent Management',
            avatarUrl: '',
            statusColor: 'green',
            reportsCount: 5,
            children: [
                {
                    id: 'tm-nadirson',
                    fullName: 'Nadirson Rodrigues',
                    title: 'Talent Manager',
                    department: 'Talent Management',
                    avatarUrl: '',
                    statusColor: 'green',
                    reportsCount: 1,
                    children: [
                        {
                            id: 'c-anhelina',
                            fullName: 'Anhelina Dmytrenko',
                            title: 'Consultant',
                            department: 'Consulting',
                            avatarUrl: '',
                            statusColor: 'green',
                            reportsCount: 0,
                            children: []
                        }
                    ]
                },
                {
                    id: 'tm-catarina',
                    fullName: 'Catarina Monteiro',
                    title: 'Talent Manager',
                    department: 'Talent Management',
                    avatarUrl: '',
                    statusColor: 'green',
                    reportsCount: 1,
                    children: [
                        {
                            id: 'c-rodrigo',
                            fullName: 'Rodrigo Carvalho',
                            title: 'Consultant',
                            department: 'Consulting',
                            avatarUrl: '',
                            statusColor: 'green',
                            reportsCount: 0,
                            children: []
                        }
                    ]
                },
                {
                    id: 'tm-awal',
                    fullName: 'Awal Umar',
                    title: 'Talent Manager',
                    department: 'Talent Management',
                    avatarUrl: '',
                    statusColor: 'green',
                    reportsCount: 1,
                    children: [
                        {
                            id: 'c-vitalina',
                            fullName: 'Vitalina Holubenko',
                            title: 'Consultant',
                            department: 'Consulting',
                            avatarUrl: '',
                            statusColor: 'green',
                            reportsCount: 0,
                            children: []
                        }
                    ]
                },
                {
                    id: 'tm-karine',
                    fullName: 'Karine Cardoso',
                    title: 'Talent Manager',
                    department: 'Talent Management',
                    avatarUrl: '',
                    statusColor: 'green',
                    reportsCount: 1,
                    children: [
                        {
                            id: 'c-pedro',
                            fullName: 'Pedro Pereira',
                            title: 'Consultant',
                            department: 'Consulting',
                            avatarUrl: '',
                            statusColor: 'green',
                            reportsCount: 0,
                            children: []
                        }
                    ]
                }
            ]
        },
        // --- Catalina Ghita - Talent Manager ---
        {
            id: 'tm-catalina',
            fullName: 'Catalina Ghita',
            title: 'Talent Manager',
            department: 'Talent Management',
            avatarUrl: '',
            statusColor: 'green',
            reportsCount: 5,
            children: [
                {
                    id: 'c-eduardo',
                    fullName: 'Eduardo Losekann',
                    title: 'Consultant',
                    department: 'Consulting',
                    avatarUrl: '',
                    statusColor: 'green',
                    reportsCount: 0,
                    children: []
                },
                {
                    id: 'c-ricardo',
                    fullName: 'Ricardo Matos',
                    title: 'Consultant',
                    department: 'Consulting',
                    avatarUrl: '',
                    statusColor: 'green',
                    reportsCount: 0,
                    children: []
                },
                {
                    id: 'c-moises',
                    fullName: 'Moises Madade',
                    title: 'Consultant',
                    department: 'Consulting',
                    avatarUrl: '',
                    statusColor: 'green',
                    reportsCount: 0,
                    children: []
                },
                {
                    id: 'c-jose',
                    fullName: 'José Domingues',
                    title: 'Consultant',
                    department: 'Consulting',
                    avatarUrl: '',
                    statusColor: 'green',
                    reportsCount: 0,
                    children: []
                },
                {
                    id: 'c-marta',
                    fullName: 'Marta Alves',
                    title: 'Consultant',
                    department: 'Consulting',
                    avatarUrl: '',
                    statusColor: 'green',
                    reportsCount: 0,
                    children: []
                }
            ]
        },
        // --- Marisa Russo - Talent Manager ---
        {
            id: 'tm-marisa',
            fullName: 'Marisa Russo',
            title: 'Talent Manager',
            department: 'Talent Management',
            avatarUrl: '',
            statusColor: 'green',
            reportsCount: 5,
            children: [
                {
                    id: 'c-beatriz-c',
                    fullName: 'Beatriz Costa',
                    title: 'Consultant',
                    department: 'Consulting',
                    avatarUrl: '',
                    statusColor: 'green',
                    reportsCount: 0,
                    children: []
                },
                {
                    id: 'c-marcus',
                    fullName: 'Marcus Dias',
                    title: 'Consultant',
                    department: 'Consulting',
                    avatarUrl: '',
                    statusColor: 'green',
                    reportsCount: 0,
                    children: []
                },
                {
                    id: 'c-coco',
                    fullName: 'Coco Laichun',
                    title: 'Consultant',
                    department: 'Consulting',
                    avatarUrl: '',
                    statusColor: 'green',
                    reportsCount: 0,
                    children: []
                },
                {
                    id: 'c-seif',
                    fullName: 'Seif Eddine Kemala',
                    title: 'Consultant',
                    department: 'Consulting',
                    avatarUrl: '',
                    statusColor: 'green',
                    reportsCount: 0,
                    children: []
                },
                {
                    id: 'c-saranyaa',
                    fullName: 'Saranyaa Chanda',
                    title: 'Consultant',
                    department: 'Consulting',
                    avatarUrl: '',
                    statusColor: 'green',
                    reportsCount: 0,
                    children: []
                }
            ]
        },
        // --- Joao Lopes - Talent Manager ---
        {
            id: 'tm-joao',
            fullName: 'Joao Lopes',
            title: 'Talent Manager',
            department: 'Talent Management',
            avatarUrl: '',
            statusColor: 'green',
            reportsCount: 3,
            children: [
                {
                    id: 'c-beatriz-cast',
                    fullName: 'Beatriz Castanheira',
                    title: 'Consultant',
                    department: 'Consulting',
                    avatarUrl: '',
                    statusColor: 'green',
                    reportsCount: 0,
                    children: []
                },
                {
                    id: 'c-stepan',
                    fullName: 'Stepan Kuznetsov',
                    title: 'Consultant',
                    department: 'Consulting',
                    avatarUrl: '',
                    statusColor: 'green',
                    reportsCount: 0,
                    children: []
                },
                {
                    id: 'c-hafiz',
                    fullName: 'Hafiz Muhammad Usman',
                    title: 'Consultant',
                    department: 'Consulting',
                    avatarUrl: '',
                    statusColor: 'green',
                    reportsCount: 0,
                    children: []
                }
            ]
        },
        // --- Emmanuel Guedes - Talent Manager ---
        {
            id: 'tm-emmanuel',
            fullName: 'Emmanuel Guedes',
            title: 'Talent Manager',
            department: 'Talent Management',
            avatarUrl: '',
            statusColor: 'green',
            reportsCount: 2,
            children: [
                {
                    id: 'c-barbara',
                    fullName: 'Barbara Loureiro',
                    title: 'Consultant',
                    department: 'Consulting',
                    avatarUrl: '',
                    statusColor: 'green',
                    reportsCount: 0,
                    children: []
                },
                {
                    id: 'c-irina',
                    fullName: 'Irina Makarova',
                    title: 'Consultant',
                    department: 'Consulting',
                    avatarUrl: '',
                    statusColor: 'green',
                    reportsCount: 0,
                    children: []
                }
            ]
        },
        // --- Domain Leaders (TBD) ---
        {
            id: 'dl-events',
            fullName: 'TBD',
            title: 'Event Domain Leader',
            department: 'Domain Leadership',
            avatarUrl: '',
            statusColor: 'gray',
            reportsCount: 0,
            children: []
        },
        {
            id: 'dl-journey',
            fullName: 'TBD',
            title: 'Journey Domain Leader',
            department: 'Domain Leadership',
            avatarUrl: '',
            statusColor: 'gray',
            reportsCount: 0,
            children: []
        },
        {
            id: 'dl-recruitment',
            fullName: 'TBD',
            title: 'Recruitment Domain Leader',
            department: 'Domain Leadership',
            avatarUrl: '',
            statusColor: 'gray',
            reportsCount: 0,
            children: []
        },
        {
            id: 'dl-communication',
            fullName: 'TBD',
            title: 'Communication Domain Leader',
            department: 'Domain Leadership',
            avatarUrl: '',
            statusColor: 'gray',
            reportsCount: 0,
            children: []
        }
    ]
};

export const DEPARTMENTS = [
    'All Departments',
    'Direction',
    'HR & Finance',
    'Talent Management',
    'Consulting',
    'Domain Leadership',
    'HR Department',
    'Business Development'
];

export const DEPARTMENT_BADGE: Record<string, { bg: string; text: string }> = {
    'Direction': { bg: 'bg-purple-100 dark:bg-purple-900/40', text: 'text-purple-700 dark:text-purple-300' },
    'HR & Finance': { bg: 'bg-pink-100 dark:bg-pink-900/40', text: 'text-pink-700 dark:text-pink-300' },
    'Talent Management': { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-700 dark:text-blue-300' },
    'Consulting': { bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-700 dark:text-green-300' },
    'Domain Leadership': { bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-700 dark:text-amber-300' },
    'HR Department': { bg: 'bg-rose-100 dark:bg-rose-900/40', text: 'text-rose-700 dark:text-rose-300' },
    'Business Development': { bg: 'bg-teal-100 dark:bg-teal-900/40', text: 'text-teal-700 dark:text-teal-300' },
};
