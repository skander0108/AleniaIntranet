import { OrgNode } from '../../core/models/org-chart.model';

export const ORG_CHART_DATA: OrgNode = {
    id: 'ceo-1',
    fullName: 'Elena Rodriguez',
    title: 'Chief Executive Officer',
    department: 'Executive',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDzIive__L2U2Z3lccqW7TCQDIjOhZyNxiATAjFXKYrM4DknWrJd1eiiyt1eBgCPit87uoPEVn8pxtHwYuRH_8TvJtUbaEPKa9M9Dmuvq4sNGHa9PdEZ5G8IsRRgVBwA2psxoCK57dh6B3TGEh84boqwD0EKrxSk_skli2ZZQmg4mtKEg8NSIBV7c8TzYtKhRJH9lTQuQdQ48XXr1qYq-PEbQJd5xZItP_ZXpNI0JEMfI1r6UpJgsykxZgei5HsmxwQ4BPq5-L-sOIH',
    statusColor: 'green',
    reportsCount: 4,
    children: [
        {
            id: 'cto-1',
            fullName: 'Marcus Chen',
            title: 'Chief Technology Officer',
            department: 'Engineering',
            avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALG23hGvPUB3srzJavwQ8ImkyphkGPVvXD4lRtnF3XmDe8febOsyI0DtyF86DVeOM11cgfnb32rmxRH48kJeYuLMA3d9SfEyxs1dBEbVZEvxeABpAC__5qgjfPBIE4Y600dpwPTjzP0LwDIrITtuFjgEzN-TKUbATQbxHupGv6pc0eMCLH8g9pogQy241J_CnZVEQdfqRT2wdukLHdH0CD8qAzCBwQ0_ARg85HRiROX7FuNxkBRcM_8mbu8Z3kfKTYZlM6BpHRqMcO',
            statusColor: 'green',
            reportsCount: 2,
            children: [
                {
                    id: 'head-fe-1',
                    fullName: 'Sarah L.',
                    title: 'Head of Frontend',
                    department: 'Engineering',
                    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCyepTE0wrM_sxMOeFFnYNUg0I98E_dXbr0Ed9WdtcHn2CzpqQTYT9SDZDTB0Z5murIXIAadx097LnXnUQ_V7P2g2RO5eUcdQLx8C6lL2ToZlhacmZh9jKypkkjeW-ojSArl82Mv_o1lJLhLVLzY1wZY0QUS4GuAyjMB-ajz572XnyQ7_DnIZ9S5sbD-a9tLGY_fwSGXT_AVPg5edZ_t0K6VhUS-uPeOtbGXFGYKV_OXh_iTdwVPWKYA-4j39GU4KnCDCnMtTcQ9djH',
                    statusColor: 'green',
                    reportsCount: 8,
                    children: []
                },
                {
                    id: 'head-be-1',
                    fullName: 'James P.',
                    title: 'Head of Backend',
                    department: 'Engineering',
                    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9Bzh8wT-heDmN-U8ivbFLg32V520XIRqucPP4xZcgMsUum4DpXRpyR2_8zz_b0327_UfDTZKZaPn-kBFaga3wdfEFGjVOoxel4xsgP0hqPy13BhuS3ePJgy6vjbzdjnhdmjNEZIo7Hk77HzOFHEHfEPU4xn87AM3Tx3h875vkY02D1z-eeyYt30sP_lA6diKkWeXeo7D9_psSkDx2cq2bPTEBbTHN5wFZ7aSrFgCRvKNJAd8WcZlScig0Otq8aqIzj0QWnYrI9Ndt',
                    statusColor: 'yellow',
                    reportsCount: 12,
                    children: []
                }
            ]
        },
        {
            id: 'vps-1',
            fullName: 'Sofia Davis',
            title: 'VP of Sales',
            department: 'Sales',
            avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlMGjCKNxpQbBKylt8Q70YJ6KqlezLohpYdnk0l-v0qIJul_tH-ho7YlgjcQEJsjtxazs1ExDkfOD57zia1G3UoGI3niGe-s7aMRJDuoiutCfQ7UWeXQQ8UAyrVYUTlvsRMG5Mi8UgiHKOGQ2HTh63F6ATyUMxPsWeZTnHkA1j-djbS8KiYvp-CIFoMV5djTu8u-u4o_DXASY8kraQR5RIaYa3txOsMEpS0VhKC3Zp6cilfN4bCdtz-osmIM-oVsq1l2cQpC1c5Qzb',
            statusColor: 'green',
            reportsCount: 5,
            children: []
        },
        {
            id: 'vphr-1',
            fullName: 'David Kim',
            title: 'VP of Human Resources',
            department: 'Human Resources',
            avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgiRBdaX6y3-8wU6tU8mXWlzhYD1H-PF1OvGJWb_wkfjvy8medHpTvaA94Jx8T72Kez_hiunPtE13GPiL1BBMQorSv7APhP_sbK0KL-SQxLrtGhpIhMseIJkDe92KFqDttOQTq24srqVeF_e6G1KFMerHm0o1yxMgrEyDOJ5_iAq6dtpq4LVTYZOZ7vusj9bfB-9tJl9gDYOJ7CdgJJm99xtsT-yafGMXt0uvAUPiHasqSvheGq8AtOxX_GFjGf45mmuKU52Y8Um4N',
            statusColor: 'green',
            reportsCount: 3,
            children: []
        },
        {
            id: 'cfo-1',
            fullName: 'Robert Fox',
            title: 'Chief Financial Officer',
            department: 'Finance',
            avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-5t9qcJhkkwr_tFe8bMzisTM0JOVEMSnQnedmcRNsxABt1uCL43h0Fb8tZdaWHt7GkydEHqOPnpUDuE-LdCCjZqdaOjtskrGmuUm_MZYcp5eYC0o8mwKIcd3mxjJI0RjW1aXN9HNQ8KHSAruBbSiZ1agl0jowWQ0txg30m_x7dnFrPmJGiIJS52Yru8qlBsMXSl2fgTwvzJrZXcx9nzKnFQjo4lzLbvzGAMpQyFwc4bWNevqu-9W5gMcsXzRmedoajRthJGraUbtl',
            statusColor: 'green',
            reportsCount: 4,
            children: []
        }
    ]
};

export const DEPARTMENTS = ['All Departments', 'Executive', 'Engineering', 'Human Resources', 'Marketing', 'Sales', 'Finance'];

export const DEPARTMENT_BADGE: Record<string, { bg: string; text: string }> = {
    'Executive': { bg: 'bg-purple-100 dark:bg-purple-900/40', text: 'text-purple-700 dark:text-purple-300' },
    'Engineering': { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-700 dark:text-blue-300' },
    'Sales': { bg: 'bg-purple-100 dark:bg-purple-900/40', text: 'text-purple-700 dark:text-purple-300' },
    'Human Resources': { bg: 'bg-pink-100 dark:bg-pink-900/40', text: 'text-pink-700 dark:text-pink-300' },
    'Marketing': { bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-700 dark:text-amber-300' },
    'Finance': { bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-700 dark:text-green-300' },
};
