import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User as UserIcon } from "lucide-react";

type Message = {
  id: string;
  type: 'bot' | 'user';
  text: string;
  timestamp: Date;
};

type FAQ = {
  question: string;
  answer: string;
};

const faqs: FAQ[] = [
  {
    question: "Как сделать заказ?",
    answer: "Для оформления заказа войдите в систему, выберите тип продукта (фотоальбом, фотографии или календарь), настройте параметры, загрузите фотографии или закажите фотографа, и подтвердите заказ."
  },
  {
    question: "Какие форматы фотографий поддерживаются?",
    answer: "Мы поддерживаем все стандартные форматы изображений: JPG, PNG, HEIC. Для лучшего качества печати рекомендуем использовать файлы с разрешением не менее 300 DPI."
  },
  {
    question: "Сколько стоит доставка?",
    answer: "Стоимость доставки зависит от вашего региона и размера заказа. При оформлении заказа вы увидите точную стоимость доставки. Бесплатная доставка при заказе от 5000 рублей."
  },
  {
    question: "Как долго выполняется заказ?",
    answer: "Стандартный срок изготовления — 3-5 рабочих дней. Срочное изготовление (1-2 дня) доступно за дополнительную плату. Доставка по Москве занимает 1-2 дня, по России — 3-7 дней."
  },
  {
    question: "Можно ли заказать фотографа?",
    answer: "Да! Мы предлагаем услуги профессиональных фотографов. При оформлении заказа выберите опцию 'Заказать фотографа', укажите дату, время и место съемки. Стоимость услуг фотографа начинается от 2000 рублей в час."
  },
  {
    question: "Какие типы фотоальбомов доступны?",
    answer: "Мы предлагаем фотоальбомы с твердой и мягкой обложкой, различных размеров (A4, A5, квадратные). Доступна печать на обложке и различные варианты переплета."
  },
  {
    question: "Можно ли отредактировать заказ после оформления?",
    answer: "Заказ можно отредактировать до начала производства. Свяжитесь с нашей службой поддержки как можно скорее после оформления заказа."
  },
  {
    question: "Какая гарантия качества?",
    answer: "Мы гарантируем высокое качество всех наших продуктов. Если вы не удовлетворены результатом, мы переделаем заказ бесплатно или вернем деньги."
  }
];

export function FAQChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      text: 'Здравствуйте! Я бот-помощник Netprint. Выберите вопрос из списка ниже, и я помогу вам.',
      timestamp: new Date()
    }
  ]);
  const [availableQuestions, setAvailableQuestions] = useState<string[]>(
    faqs.map(faq => faq.question)
  );
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleQuestionClick = (question: string) => {
    const faq = faqs.find(f => f.question === question);
    if (!faq) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: question,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: faq.answer,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 500);

    setAvailableQuestions(prev => prev.filter(q => q !== question));
  };

  const handleReset = () => {
    setMessages([
      {
        id: '1',
        type: 'bot',
        text: 'Здравствуйте! Я бот-помощник Netprint. Выберите вопрос из списка ниже, и я помогу вам.',
        timestamp: new Date()
      }
    ]);
    setAvailableQuestions(faqs.map(faq => faq.question));
  };

  return (
    <Card className="max-w-3xl mx-auto overflow-hidden">
      <CardHeader className="bg-primary/5 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">Бот-помощник Netprint</CardTitle>
            <p className="text-sm text-muted-foreground">Ответы на часто задаваемые вопросы</p>
          </div>
          {messages.length > 1 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleReset}
              data-testid="button-reset-chat"
            >
              Начать сначала
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-96" ref={scrollAreaRef}>
          <div className="p-6 space-y-4">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500`}
                style={{ animationDelay: `${index * 100}ms` }}
                data-testid={`message-${message.type}-${index}`}
              >
                {message.type === 'bot' ? (
                  <>
                    <div className="flex-shrink-0 p-2 rounded-full bg-primary/10 h-fit">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-muted rounded-lg p-4">
                        <p className="text-sm">{message.text}</p>
                      </div>
                      <span className="text-xs text-muted-foreground ml-2 mt-1 block">
                        {message.timestamp.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex-1 flex flex-col items-end">
                      <div className="bg-primary text-primary-foreground rounded-lg p-4 max-w-sm">
                        <p className="text-sm">{message.text}</p>
                      </div>
                      <span className="text-xs text-muted-foreground mr-2 mt-1 block">
                        {message.timestamp.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex-shrink-0 p-2 rounded-full bg-primary/10 h-fit">
                      <UserIcon className="h-5 w-5 text-primary" />
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {availableQuestions.length > 0 && (
          <div className="border-t p-6 bg-muted/30">
            <p className="text-sm font-medium mb-3">Выберите вопрос:</p>
            <div className="flex flex-wrap gap-2">
              {availableQuestions.map((question) => (
                <Badge
                  key={question}
                  variant="outline"
                  className="cursor-pointer hover-elevate active-elevate-2 px-3 py-2 text-sm"
                  onClick={() => handleQuestionClick(question)}
                  data-testid={`faq-question-${question}`}
                >
                  {question}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
