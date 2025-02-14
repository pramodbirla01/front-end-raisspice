import React from 'react';
import { termsAndConditionArray } from '@/app/utils/data';

interface TermsAndConditionsProps {
    className?: string;
}

const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({ className = '' }) => {
    return (
        <div className={`termsAndConditions_container bg-bgColor pb-16 ${className}`}>
            <div className="termsAndConditions_inner_container w-[95%] max-sm:w-[95%] 2xl:w-[70%] mx-auto">
                <h1 className="text-5xl font-bold text-center py-12 text-gray-800">
                    Terms and Conditions
                </h1>

                <div className="space-y-6 text-gray-700">
                    {
                        termsAndConditionArray?.map((currElem, index) => {
                            return (
                                <div key={index} className="flex gap-2">
                                    <span className="font-medium">{index + 1}.</span>
                                    <p className="text-base leading-relaxed">
                                        {currElem.info}
                                    </p>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        </div>
    );
};

export default TermsAndConditions;