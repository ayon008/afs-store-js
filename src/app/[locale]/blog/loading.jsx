import Skeleton from '@/Shared/Loader/Skeleton';

export default function Loading() {
    return <div className='w-full min-h-screen bg-white'>
        <div>
            <Skeleton className='w-full h-[80vh]' />
        </div>
    </div>
}