interface Input {
  name: string;
  label: string;
  description: string;
}

interface Form {
  benefactor: Input;
  amount: Input;
  description: Input;
  date: Input;
}

const supportedFormTypes = ['earning', 'payout'];

export function getFormCopy(formType: string): Form {
  if (!supportedFormTypes.includes(formType)) {
    throw new Error('Form type not supported');
  }

  if (formType === 'earning') {
    return {
      benefactor: {
        name: 'benefactor',
        label: 'Benefactor',
        description: 'Who earned it?'
      },
      amount: {
        name: 'amount',
        label: 'Amount',
        description: 'How much was earned?'
      },
      description: {
        name: 'description',
        label: 'For',
        description: 'What happened to earn this?'
      },
      date: {
        name: 'date',
        label: 'Date Earned',
        description: 'When did this happen?'
      }
    }
  }

  return {
    benefactor: {
      name: 'benefactor',
      label: 'Benefactor',
      description: 'Who was paid?'
    },
    amount: {
      name: 'amount',
      label: 'Amount',
      description: 'How much was paid?'
    },
    description: {
      name: 'description',
      label: 'Payment Type',
      description: 'How was this paid out (robux, cash, etc.)?'
    },
    date: {
      name: 'date',
      label: 'Date Paid',
      description: 'When was this paid?'
    }
  };
}
