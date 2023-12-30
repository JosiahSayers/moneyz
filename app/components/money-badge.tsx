import { Badge, BadgeProps } from "@mantine/core";

interface Props extends BadgeProps {
  isPayout?: boolean;
}

export default function MoneyBadge({ isPayout, children, ...props}: Props) {
  const variantProps = isPayout ? {
    variant: "gradient",
    gradient: { from: 'blue', to: 'teal', deg: 90 }
  } : {};

  return <Badge {...variantProps} {...props}>{children}</Badge>
}
