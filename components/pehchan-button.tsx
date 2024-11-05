import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"

interface PehchanButtonProps {
  onClick: () => void;
}

export default function PehchanButton({ onClick }: PehchanButtonProps) {
  return (
    <Button 
      className="bg-[#00875A] hover:bg-[#006644] dark:bg-white dark:hover:bg-gray-100 text-white dark:text-[#00875A] h-full font-medium py-2 px-4 rounded-md flex items-center justify-center transition-colors"
      onClick={onClick}
    >
      <Icons.whiteLogo className="w-4 h-4 mr-2" />
       Continue with Pehchan
    </Button>
  )
}