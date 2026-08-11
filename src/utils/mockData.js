export const mockGroups = [
  { id: 'g1', name: '상품등록' },
  { id: 'g2', name: '가격변경' },
  { id: 'g3', name: '상세이미지 수정' },
];

export const mockUsers = [
  { id: '주홍준', pw: 'a1', name: '주홍준', role: 'admin1' }, // admin can edit everything
  { id: '고미란', pw: 'a1', name: '고미란', role: 'admin2' }, // admin can edit everything
  { id: '탁성미', pw: 'a1', name: '탁성미', role: 'admin3' }, // admin can edit everything
  { id: '장현정', pw: 'a1', name: '장현정', role: 'admin4' }, // admin can edit everything
  { id: '허우연', pw: 'a1', name: '허우연', role: 'user1' },
  { id: '연지영', pw: 'a1', name: '연지영', role: 'user2' },
  { id: '김송이', pw: 'a1', name: '김송이', role: 'user3' },
  { id: '이단비', pw: 'a1', name: '이단비', role: 'user5' },
  { id: '이재임', pw: 'a1', name: '이재임', role: 'user6' },
  { id: '한정민', pw: 'a1', name: '한정민', role: 'user7' },
  { id: '최준식', pw: 'a1', name: '최준식', role: 'user8' },
];

export const mockTasks = [
  {
    id: 't1',
    groupId: 'g1',
    order: 0,
    title: '신규 마케팅 캠페인 기획',
    createdAt: '2026-07-25T10:00:00Z',
    dueDate: '2026-08-05T23:59:59Z',
    completedAt: null,
    status: 'In Progress',
    assignees: [
      { userId: 'u1', checked: true },
      { userId: 'u2', checked: false },
    ],
  },
  {
    id: 't2',
    groupId: 'g1',
    order: 1,
    title: 'SNS 광고 소재 제작',
    createdAt: '2026-07-26T11:00:00Z',
    dueDate: '2026-07-30T23:59:59Z', // Overdue
    completedAt: null,
    status: 'In Progress',
    assignees: [
      { userId: 'u3', checked: false },
    ],
  },
  {
    id: 't3',
    groupId: 'g2',
    order: 0,
    title: '프론트엔드 UI 리팩토링',
    createdAt: '2026-07-28T09:00:00Z',
    dueDate: '2026-08-10T23:59:59Z',
    completedAt: null,
    status: 'Pending',
    assignees: [
      { userId: 'u4', checked: false },
      { userId: 'u2', checked: false },
      { userId: 'u1', checked: false },
    ],
  }
];
