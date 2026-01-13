import PageShimmer from '@/Shared/Loader/PageShimmerServer';
import LoadingWrapper from '@/Shared/Loader/LoadingWrapper';

export default function Loading() {
    return (
        <LoadingWrapper>
            <PageShimmer />
        </LoadingWrapper>
    );
}
