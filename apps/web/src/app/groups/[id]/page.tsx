import { GroupScreen } from '@/components/GroupScreen'

export default function GroupPage({ params }: { params: { id: string } }) {
  return <GroupScreen id={params.id} />
}
