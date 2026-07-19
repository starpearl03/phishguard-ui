import { Suspense } from 'react';
import { InferenceShell } from '@/src/features/inference/components/inference-shell';
import { PageLoader } from '@/src/components/layout';

export default function InferencePage() {
    return (
        <Suspense fallback={<PageLoader />}>
            <InferenceShell />
        </Suspense>
    );
}
