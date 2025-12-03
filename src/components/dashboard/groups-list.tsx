import { arisanData } from '@/app/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Users } from 'lucide-react';

export function GroupsList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Arisan Groups</CardTitle>
        <CardDescription>Manage and view all family arisan groups.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {arisanData.groups.map((group) => (
          <div key={group.id} className="flex items-center space-x-4 rounded-md border p-4">
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">{group.name}</p>
              <p className="text-sm text-muted-foreground">
                {group.memberIds.length} members
              </p>
            </div>
            <div className="text-right">
                <p className="text-sm font-semibold">
                {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                }).format(group.contributionAmount)}
                </p>
                <p className="text-xs text-muted-foreground capitalize">{group.cycle}</p>
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button className="w-full">
          <Users className="mr-2 h-4 w-4" />
          Manage Groups
        </Button>
      </CardFooter>
    </Card>
  );
}
