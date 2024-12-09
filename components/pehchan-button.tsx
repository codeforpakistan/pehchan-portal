import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"

interface PehchanButtonProps {
  onClick: () => void;
}

export default function PehchanButton({ onClick }: PehchanButtonProps) {
  return (
    <Button 
      className="bg-primary hover:bg-green-700 gap-2 text-white h-full py-2 px-4 rounded-md flex items-center justify-center transition-colors"
      onClick={onClick}
    >
      <Icons.whiteLogo  />
       Continue with Pehchan
    </Button>
  )
}