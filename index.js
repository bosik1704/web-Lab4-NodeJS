import { Command } from 'commander';
import fs from 'fs'; // Вбудований модуль Node.js для роботи з файлами

const program = new Command();

program
  .name('bank-managers-cli')
  .description('CLI для роботи з даними менеджерів банків')
  .version('1.0.0');

// Налаштовуємо прапорці (команди), які ми зможемо вводити в термінал
program
  .option('-i, --input <path>', 'шлях до файлу для читання', 'bank_managers.json')
  .option('-o, --output <path>', 'шлях до файлу для збереження результату')
  .option('-d, --display', 'вивести результат у консоль')
  .option('--bank <name>', 'фільтр за назвою банку')
  .option('--role <name>', 'фільтр за посадою')
  .option('--active', 'показати лише тих, хто зараз працює (не звільнений)');

program.parse(process.argv); // Програма зчитує те, що ми ввели в термінал
const options = program.opts(); // Зберігаємо введені прапорці у змінну options

// 1. Читання файлу (використовуємо модуль fs)
let data;
try {
  // Читаємо файл як звичайний текст
  const fileContent = fs.readFileSync(options.input, 'utf8');
  // Перетворюємо текст на JavaScript-масив об'єктів
  data = JSON.parse(fileContent);
} catch (error) {
  console.error(`Помилка читання файлу: ${error.message}`);
  process.exit(1); // Зупиняємо програму, якщо файл не знайдено
}

// 2. Фільтрація даних
let result = data;

// Якщо користувач ввів --bank
if (options.bank) {
  result = result.filter(manager => 
    manager.BANK_NAMES_HISTORY && 
    manager.BANK_NAMES_HISTORY.toLowerCase().includes(options.bank.toLowerCase())
  );
}

// Якщо користувач ввів --role
if (options.role) {
  result = result.filter(manager => 
    manager.NAME_DOLGN && 
    manager.NAME_DOLGN.toLowerCase().includes(options.role.toLowerCase())
  );
}

// Якщо користувач ввів --active (шукаємо тих, у кого DATE_UVOL дорівнює null)
if (options.active) {
  result = result.filter(manager => manager.DATE_UVOL === null);
}

// 3. Вивід у консоль (якщо є прапорець -d)
if (options.display) {
  if (result.length === 0) {
    console.log('За заданими критеріями нічого не знайдено.');
  } else {
    result.forEach(manager => {
      console.log(`[${manager.PERSON_ID}] ${manager.LAST_NAME} ${manager.FIRST_NAME} - ${manager.NAME_DOLGN}`);
      console.log(`Банк: ${manager.FULLNAME}`);
      console.log('---');
    });
  }
}

// 4. Запис у файл (якщо є прапорець -o)
if (options.output) {
  try {
    // Перетворюємо відфільтрований масив назад у текст (JSON) і зберігаємо
    fs.writeFileSync(options.output, JSON.stringify(result, null, 2), 'utf8');
    console.log(`Результат успішно збережено у файл: ${options.output}`);
  } catch (error) {
    console.error(`Помилка запису файлу: ${error.message}`);
  }
}

// Якщо користувач не вказав ні -d, ні -o, підказуємо йому
if (!options.display && !options.output) {
  console.log('Ви не вказали дію. Додайте -d для виводу в консоль або -o <назва_файлу> для збереження.');
}